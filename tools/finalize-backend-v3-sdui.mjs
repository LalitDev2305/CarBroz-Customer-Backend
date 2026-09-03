import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);

function patch(relative, transform) {
  const file = p(relative);
  if (!fs.existsSync(file)) return;
  fs.writeFileSync(file, transform(fs.readFileSync(file, 'utf8')));
}

// Foundation owns universal application errors; expose them through its public
// boundary so domains/SDUI never deep-import Foundation internals.
patch('foundation/kernel/src/public/index.ts', (text) => {
  if (!text.includes("../errors/exceptions.js")) text += "\nexport * from '../errors/exceptions.js';\n";
  return text;
});

// The frozen SDUI scopes are GLOBAL, PARTNER and CUSTOMER. Admin manages the
// registry but is not itself an SDUI-rendered target application.
patch('sdui/ui-sdk/src/contract/common.schema.ts', (text) =>
  text.replace("z.enum(['CUSTOMER', 'PARTNER', 'ADMIN'])", "z.enum(['GLOBAL', 'CUSTOMER', 'PARTNER'])")
);

// Use the canonical target-app type instead of unbounded strings at Registry
// application boundaries.
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
