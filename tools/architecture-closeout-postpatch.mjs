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

// Product surfaces own their transport schemas independently. Copying a schema is intentional here:
// sharing transport DTOs between products would couple public APIs even when the business use case is shared.
for (const name of ['review.dto.ts', 'coupon.dto.ts', 'dispute.dto.ts']) {
  const source = p('apps/api/src/surfaces/customer/dto', name);
  const target = p('apps/api/src/surfaces/admin/dto', name);
  if (exists(source)) {
    ensureDir(path.dirname(target));
    fs.copyFileSync(source, target);
  }
}

const adminRewrites = new Map([
  ['apps/api/src/surfaces/admin/routes/review.routes.ts', ["../../customer/dto/review.dto.js", "../dto/review.dto.js"]],
  ['apps/api/src/surfaces/admin/routes/coupon.routes.ts', ["../../customer/dto/coupon.dto.js", "../dto/coupon.dto.js"]],
  ['apps/api/src/surfaces/admin/routes/dispute.routes.ts', ["../../customer/dto/dispute.dto.js", "../dto/dispute.dto.js"]],
]);
for (const [fileRel, [from, to]] of adminRewrites) {
  const file = p(fileRel);
  if (exists(file)) write(file, read(file).replaceAll(from, to));
}

// The architecture tests must never recurse into VCS internals while scanning the repository.
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
for (const surface of surfaces) {
  const surfaceRoot = p('apps/api/src/surfaces', surface);
  for (const file of walk(surfaceRoot).filter((f) => f.endsWith('.ts'))) {
    const content = read(file);
    for (const other of surfaces.filter((candidate) => candidate !== surface)) {
      const relativePatterns = [
        new RegExp(`from\\s+['\"][^'\"]*\\/${other}\\/`, 'g'),
        new RegExp(`from\\s+['\"]@carbroz\\/api[^'\"]*${other}`, 'g'),
      ];
      if (relativePatterns.some((pattern) => pattern.test(content))) {
        violations.push(`${path.relative(root, file)} imports ${other} surface`);
      }
    }
  }
}

// Tests may live near source, but production package builds must not accidentally depend on Vitest.
// Fail loudly rather than silently moving a test whose relative imports might become semantically different.
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

console.log('[architecture-closeout-postpatch] surface isolation and safety invariants passed');
