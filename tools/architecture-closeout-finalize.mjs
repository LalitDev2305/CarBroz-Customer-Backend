import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const apiSource = path.join(root, 'apps/api/src');
const surfaces = path.join(apiSource, 'surfaces');

const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};

const walk = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return entry.isFile() && entry.name.endsWith('.ts') ? [absolute] : [];
  });
};

// Final topology accepts only the canonical workspace roots. Transitional packages/ must be gone.
if (fs.existsSync(path.join(root, 'packages'))) {
  throw new Error('Transitional top-level packages/ still exists after closeout');
}
const workspaceFile = path.join(root, 'pnpm-workspace.yaml');
const workspace = fs.existsSync(workspaceFile) ? fs.readFileSync(workspaceFile, 'utf8') : '';
const requiredWorkspaceRoots = ['apps/*', 'domains/*', 'sdui/*', 'platform/*', 'foundation/*'];
for (const workspaceRoot of requiredWorkspaceRoots) {
  if (!workspace.includes(`"${workspaceRoot}"`) && !workspace.includes(`'${workspaceRoot}'`) && !workspace.includes(`- ${workspaceRoot}`)) {
    throw new Error(`Canonical workspace root missing after closeout: ${workspaceRoot}`);
  }
}
if (/packages\/\*/.test(workspace)) throw new Error('pnpm workspace still includes transitional packages/*');

// The frozen API topology is transport/composition only. These legacy directories are evidence
// that apps/api is still acting as a second application/infrastructure ownership layer.
const legacyApiRoots = ['modules', 'container', 'providers'];
const legacyResidue = legacyApiRoots.filter((name) => fs.existsSync(path.join(apiSource, name)));
if (legacyResidue.length) {
  throw new Error(`Legacy API ownership roots remain after closeout: ${legacyResidue.join(', ')}`);
}

// Admin and Customer may validate similar payloads, but their transport contracts are
// independently versioned. Duplicate the transport schema instead of importing another surface.
for (const name of ['review.dto.ts', 'coupon.dto.ts']) {
  const source = path.join(surfaces, 'customer/dto', name);
  const target = path.join(surfaces, 'admin/dto', name);
  if (fs.existsSync(source) && !fs.existsSync(target)) write(target, fs.readFileSync(source, 'utf8'));
}

for (const file of walk(path.join(surfaces, 'admin'))) {
  let content = fs.readFileSync(file, 'utf8');
  content = content
    .replaceAll('../../customer/dto/review.dto.js', '../dto/review.dto.js')
    .replaceAll('../../customer/dto/coupon.dto.js', '../dto/coupon.dto.js');
  write(file, content);
}

const violations = [];
const names = ['partner', 'customer', 'admin'];
for (const owner of names) {
  for (const file of walk(path.join(surfaces, owner))) {
    const content = fs.readFileSync(file, 'utf8');
    for (const other of names) {
      if (other === owner) continue;
      const marker = new RegExp(`from\\s+['"][^'"]*(?:\\.\\./)+${other}/`);
      if (marker.test(content)) violations.push(`${path.relative(root, file)} imports ${other} surface internals`);
    }
  }
}

if (violations.length) {
  throw new Error(`Product surface isolation failed:\n${violations.map((v) => `- ${v}`).join('\n')}`);
}

console.log('[architecture-closeout-finalize] canonical workspace, transport-only API topology, and product surface isolation are frozen');
