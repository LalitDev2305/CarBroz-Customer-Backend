import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'apps/api/src/modules/sdui/dtos');
const target = path.join(root, 'sdui/registry/dtos');

function copyTree(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const sourcePath = path.join(from, entry.name);
    const targetPath = path.join(to, entry.name);
    if (entry.isDirectory()) copyTree(sourcePath, targetPath);
    else if (!fs.existsSync(targetPath)) fs.copyFileSync(sourcePath, targetPath);
  }
}

// These DTOs are registry application contracts consumed by SDUI use cases.
// They were historically stored under the API module and would otherwise be
// deleted when apps/api/src/modules is retired.
copyTree(source, target);

console.log('Canonical assets preserved before legacy pruning.');
