import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);

function patch(relative, transform) {
  const file = p(relative);
  if (!fs.existsSync(file)) return;
  fs.writeFileSync(file, transform(fs.readFileSync(file, 'utf8')));
}

patch('foundation/kernel/src/public/index.ts', (text) => {
  if (!text.includes("../errors/exceptions.js")) text += "\nexport * from '../errors/exceptions.js';\n";
  return text;
});

patch('sdui/ui-sdk/src/contract/common.schema.ts', (text) =>
  text.replace("z.enum(['CUSTOMER', 'PARTNER', 'ADMIN'])", "z.enum(['GLOBAL', 'CUSTOMER', 'PARTNER'])")
);

// Registry DTOs own Zod request/schema contracts after API business logic is
// removed, so Registry must declare the dependency itself rather than relying on
// the UI SDK's transitive dependency.
patch('sdui/registry/package.json', (text) => {
  const pkg = JSON.parse(text);
  pkg.dependencies ??= {};
  pkg.dependencies.zod = '^4.4.3';
  return `${JSON.stringify(pkg, null, 2)}\n`;
});

for (const relative of [
  'sdui/registry/application/GetSduiSpecificVersionUseCase.ts',
  'sdui/registry/application/GetSduiVersionHistoryUseCase.ts',
]) {
  patch(relative, (text) => {
    if (!text.includes('SduiTargetApp')) {
      text = `import type { SduiTargetApp } from '@carbroz/ui-sdk';\n${text}`;
    }
    text = text.replace(/targetApp\?:\s*string\s*;/g, 'targetApp?: SduiTargetApp;');
    return text;
  });
}

console.log('Backend V3 SDUI contracts finalized.');
