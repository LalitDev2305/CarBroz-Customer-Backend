import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(absolute));
    else out.push(absolute);
  }
  return out;
}

for (const file of walk(p('domains')).filter((x) => x.endsWith('.ts') && !x.includes(`${path.sep}dist${path.sep}`))) {
  let text = fs.readFileSync(file, 'utf8');

  // exactOptionalPropertyTypes does not permit assigning an explicit undefined
  // to a `property?: T`. Preserve the original optional storage semantics by
  // assigning constructor input only when it is present.
  const optionalProperties = new Set();
  for (const match of text.matchAll(/(?:public\s+|private\s+|protected\s+)?(?:readonly\s+)?([A-Za-z_$][\w$]*)\?\s*:\s*[^;]+;/g)) {
    optionalProperties.add(match[1]);
  }
  for (const name of optionalProperties) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(
      new RegExp(`this\\.${escaped}\\s*=\\s*props\\.${escaped}\\s*;`, 'g'),
      `if (props.${name} !== undefined) this.${name} = props.${name};`,
    );
  }

  // Prisma callback row types can be lost while adapters are moved between
  // packages before the generated client is visible to each workspace. Keep
  // the adapter boundary explicit rather than disabling noImplicitAny.
  if (file.includes(`${path.sep}infrastructure${path.sep}repositories${path.sep}Prisma`)) {
    text = text.replace(/\.map\(\(([A-Za-z_$][\w$]*)\)\s*=>/g, '.map(($1: any) =>');
  }

  fs.writeFileSync(file, text);
}

// Optional constructor arguments that are modeled as nullable business values
// must not be forwarded as explicit undefined under exact optional semantics.
const communicationsUseCases = [
  'domains/communications/application/RegisterDeviceTokenUseCase.ts',
  'domains/communications/application/SendNotificationUseCase.ts',
];
for (const relative of communicationsUseCases) {
  const file = p(relative);
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, 'utf8');
  if (relative.endsWith('RegisterDeviceTokenUseCase.ts')) {
    text = text.replace(/appVersion:\s*input\.appVersion\s*,/g, 'appVersion: input.appVersion ?? null,');
  } else {
    text = text.replace(/bookingId:\s*input\.bookingId\s*,/g, 'bookingId: input.bookingId ?? null,');
    text = text.replace(/title:\s*input\.title\s*,/g, 'title: input.title ?? null,');
    text = text.replace(/body:\s*input\.body\s*,/g, 'body: input.body ?? null,');
    text = text.replace(/data:\s*input\.data\s*,/g, 'data: input.data ?? null,');
  }
  fs.writeFileSync(file, text);
}

console.log('Backend V3 strict TypeScript normalization finalized.');
