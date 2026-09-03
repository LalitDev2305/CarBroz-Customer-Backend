import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

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

function copyFile(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (!fs.existsSync(to)) fs.copyFileSync(from, to);
}

// Registry application DTOs were historically stored under API modules.
copyTree(
  path.join(root, 'apps/api/src/modules/sdui/dtos'),
  path.join(root, 'sdui/registry/dtos'),
);

// Corporate DTO shapes are application input contracts used by Enterprise use
// cases. Preserve a domain-owned copy before the API module tree is retired;
// HTTP validation/DTOs remain independently owned by the API surface.
copyFile(
  path.join(root, 'apps/api/src/modules/corporate/dtos/corporate.dto.ts'),
  path.join(root, 'domains/enterprise/application/contracts/corporate.contracts.ts'),
);

console.log('Canonical assets preserved before legacy pruning.');
