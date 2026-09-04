import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const api = path.join(root, 'apps/api/src');
const p = (...parts) => path.join(root, ...parts);
const exists = (file) => fs.existsSync(file);
const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, content) => {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};
const walk = (dir) => {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist', 'generated', '.git'].includes(entry.name)) return [];
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
};
const copyTransportContract = (fromSurface, sourceName, targetName = sourceName) => {
  const source = p('apps/api/src/surfaces', fromSurface, 'dto', sourceName);
  const target = p('apps/api/src/surfaces/admin/dto', targetName);
  if (!exists(source)) return;
  ensureDir(path.dirname(target));
  fs.copyFileSync(source, target);
};

// Product surfaces own transport schemas independently. Admin may reuse bounded-context application
// behavior, but it must not compile against Customer/Partner HTTP DTO modules.
for (const name of ['review.dto.ts', 'coupon.dto.ts', 'dispute.dto.ts']) {
  copyTransportContract('customer', name);
}
copyTransportContract('customer', 'catalog.catalog.dto.ts', 'admin-catalog.dto.ts');
copyTransportContract('partner', 'partner.partner.dto.ts', 'admin-partner.dto.ts');

const adminRewrites = new Map([
  ['apps/api/src/surfaces/admin/routes/review.routes.ts', ["../../customer/dto/review.dto.js", "../dto/review.dto.js"]],
  ['apps/api/src/surfaces/admin/routes/coupon.routes.ts', ["../../customer/dto/coupon.dto.js", "../dto/coupon.dto.js"]],
  ['apps/api/src/surfaces/admin/routes/dispute.routes.ts', ["../../customer/dto/dispute.dto.js", "../dto/dispute.dto.js"]],
  ['apps/api/src/surfaces/admin/controllers/admin-catalog.controller.ts', ["../../customer/dto/catalog.catalog.dto.js", "../dto/admin-catalog.dto.js"]],
  ['apps/api/src/surfaces/admin/controllers/admin-partner.controller.ts', ["../../partner/dto/partner.partner.dto.js", "../dto/admin-partner.dto.js"]],
]);
for (const [fileRel, [from, to]] of adminRewrites) {
  const file = p(fileRel);
  if (exists(file)) write(file, read(file).replaceAll(from, to));
}

// pnpm 11 reads build-script approvals from pnpm-workspace.yaml. The migration rewrites this file,
// so re-establish the canonical final workspace and narrowly allow only dependencies whose install
// scripts are required by this repository. Never enable dependency scripts globally.
write(
  p('pnpm-workspace.yaml'),
  `packages:\n  - "apps/*"\n  - "domains/*"\n  - "sdui/*"\n  - "platform/*"\n  - "foundation/*"\nallowBuilds:\n  '@prisma/client': true\n  '@prisma/engines': true\n  bcrypt: true\n  esbuild: true\n  msgpackr-extract: true\n  prisma: true\n`,
);

// Remove obsolete pnpm configuration from package.json so there is one authoritative pnpm 11 source.
const rootPackageFile = p('package.json');
if (exists(rootPackageFile)) {
  const rootPackage = JSON.parse(read(rootPackageFile));
  if (rootPackage.pnpm) delete rootPackage.pnpm;
  write(rootPackageFile, `${JSON.stringify(rootPackage, null, 2)}\n`);
}

// Prisma validate/generate require DATABASE_URL to be syntactically present even though they do not
// connect to the database. Supply a non-secret, validation-only URL in the ignored .env file for the
// one-time executor. Production configuration remains environment-owned and receives no fallback.
write(p('.env'), 'DATABASE_URL=postgresql://carbroz_validation:carbroz_validation@127.0.0.1:5432/carbroz_validation\n');

// Architecture tests must never recurse into VCS internals while scanning the repository.
for (const name of ['canonical-topology.policy.test.ts', 'engineering-quality.policy.test.ts']) {
  const file = p('tests/architecture', name);
  if (exists(file)) {
    let content = read(file);
    content = content.replace("['node_modules','dist','generated']", "['node_modules','dist','generated','.git']");
    content = content.replace("['node_modules', 'dist', 'generated']", "['node_modules', 'dist', 'generated', '.git']");
    write(file, content);
  }
}

const violations = [];
const surfaces = ['partner', 'customer', 'admin'];
const importPattern = /(?:from\s+|import\s*\(\s*)['\"]([^'\"]+)['\"]/g;

// Resolve actual relative import targets before deciding whether one product surface depends on another.
// Domain paths such as domains/partner are valid and must not be confused with apps/api/src/surfaces/partner.
for (const surface of surfaces) {
  const surfaceRoot = p('apps/api/src/surfaces', surface);
  for (const file of walk(surfaceRoot).filter((f) => f.endsWith('.ts'))) {
    const content = read(file);
    for (const match of content.matchAll(importPattern)) {
      const specifier = match[1];
      for (const other of surfaces.filter((candidate) => candidate !== surface)) {
        let importsOtherSurface = false;
        if (specifier.startsWith('.')) {
          const resolved = path.resolve(path.dirname(file), specifier.replace(/\.js$/, '.ts'));
          const otherRoot = path.resolve(p('apps/api/src/surfaces', other));
          importsOtherSurface = resolved === otherRoot || resolved.startsWith(`${otherRoot}${path.sep}`);
        } else {
          importsOtherSurface = new RegExp(`^@carbroz/api(?:/|$).*surfaces/${other}(?:/|$)`).test(specifier);
        }
        if (importsOtherSurface) {
          violations.push(`${path.relative(root, file)} imports ${other} surface via ${specifier}`);
        }
      }
    }
  }
}

// Tests may live near source, but production package builds must not accidentally depend on Vitest.
for (const base of ['domains', 'sdui', 'platform', 'foundation']) {
  for (const file of walk(p(base)).filter((f) => /\.(?:spec|test)\.ts$/.test(f))) {
    const packageRoot = file.split(path.sep).slice(0, file.includes(`${path.sep}domains${path.sep}financials${path.sep}`) ? 3 : 2).join(path.sep);
    const tsconfig = path.join(packageRoot, 'tsconfig.json');
    if (exists(tsconfig)) {
      const config = read(tsconfig);
      if (!/exclude[\s\S]*(?:spec|test)/i.test(config) && read(file).includes("from 'vitest'")) {
        violations.push(`${path.relative(root, file)} is a Vitest source inside a production package without an explicit test exclusion`);
      }
    }
  }
}

// Recheck sensitive logging after every transformation.
for (const file of walk(api).filter((f) => f.endsWith('.ts'))) {
  const content = read(file);
  if (/log\.(?:trace|debug|info|warn|error)\([^\n]*(?:mockOtp|otp|phoneNumber|refreshToken|accessToken|request\.body|response\.body|authorization)/i.test(content)) {
    violations.push(`${path.relative(root, file)} contains sensitive/raw logging`);
  }
}

if (violations.length) {
  throw new Error(`Post-closeout invariants failed:\n${violations.map((v) => `- ${v}`).join('\n')}`);
}

console.log('[architecture-closeout-postpatch] admin transport ownership, pnpm 11 workspace policy, Prisma validation environment, surface isolation, and safety invariants passed');
