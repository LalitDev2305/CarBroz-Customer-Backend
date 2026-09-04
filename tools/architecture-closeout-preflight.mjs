import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migration = path.join(root, 'tools/architecture-closeout.mjs');
let source = fs.readFileSync(migration, 'utf8');

const replacements = [
  [
    "ResponseHelper.error(`Rate limit exceeded, retry in ${context.after}`, 'TOO_MANY_REQUESTS', request.traceId)",
    "ResponseHelper.error('Rate limit exceeded, retry in ' + context.after, 'TOO_MANY_REQUESTS', request.traceId)",
  ],
  [
    "ResponseHelper.error(`Route ${request.method}:${request.url} not found`, 'NOT_FOUND', request.traceId)",
    "ResponseHelper.error('Route ' + request.method + ':' + request.url + ' not found', 'NOT_FOUND', request.traceId)",
  ],
];

for (const [from, to] of replacements) {
  if (source.includes(from)) source = source.replaceAll(from, to);
}

fs.writeFileSync(migration, source);
console.log('[architecture-closeout-preflight] deterministic syntax patches applied');
