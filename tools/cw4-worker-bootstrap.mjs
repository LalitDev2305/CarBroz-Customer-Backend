import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const sourcePath = 'tools/cw4-one-pass-codemod.mjs';
const fixedPath = 'tools/.cw4-one-pass-fixed.mjs';
let source = fs.readFileSync(sourcePath, 'utf8');

const replacements = [
  ["else throw new DomainError(`Unsupported direct transition to ${input.targetStatus}`, 'BOOKING_INVALID_TRANSITION');", "else throw new DomainError('Unsupported direct transition to ' + input.targetStatus, 'BOOKING_INVALID_TRANSITION');"],
  ["phoneNumber: `+9198${suffix.slice(0, 8)}`", "phoneNumber: '+9198' + suffix.slice(0, 8)"],
  ["name: `CW4-${suffix}`", "name: 'CW4-' + suffix"],
  ["slug: `cw4-${suffix}`", "slug: 'cw4-' + suffix"],
  ["name: `Wash-${suffix}`", "name: 'Wash-' + suffix"],
  ["slug: `wash-${suffix}`", "slug: 'wash-' + suffix"],
  ["registrationNumber: `CW4${suffix.slice(0, 7).toUpperCase()}`", "registrationNumber: 'CW4' + suffix.slice(0, 7).toUpperCase()"],
];

for (const [before, after] of replacements) {
  if (!source.includes(before)) {
    throw new Error(`CW4 worker bootstrap could not find expected fragment: ${before}`);
  }
  source = source.replaceAll(before, after);
}

fs.writeFileSync(fixedPath, source);
const check = spawnSync(process.execPath, ['--check', fixedPath], { stdio: 'inherit' });
if (check.status !== 0) process.exit(check.status ?? 1);
await import(pathToFileURL(new URL(`../${fixedPath}`, import.meta.url).pathname).href);
fs.rmSync(fixedPath, { force: true });
console.log('[cw4-worker-bootstrap] transform applied');
