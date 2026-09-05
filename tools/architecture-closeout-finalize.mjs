import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const surfaces = path.join(root, 'apps/api/src/surfaces');

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
      const marker = new RegExp(`from\\s+['\"][^'\"]*(?:\\.\\./)+${other}/`);
      if (marker.test(content)) violations.push(`${path.relative(root, file)} imports ${other} surface internals`);
    }
  }
}

if (violations.length) {
  throw new Error(`Product surface isolation failed:\n${violations.map((v) => `- ${v}`).join('\n')}`);
}

console.log('[architecture-closeout-finalize] product surface isolation is physically independent');
