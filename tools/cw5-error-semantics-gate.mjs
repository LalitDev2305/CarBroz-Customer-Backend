import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const violations = [];

function read(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    violations.push({ file, rule: 'required-file', detail: 'required error-boundary proof file is missing' });
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

function requireText(file, source, text, rule, detail) {
  if (!source.includes(text)) violations.push({ file, rule, detail });
}

function requireRegex(file, source, regex, rule, detail) {
  if (!regex.test(source)) violations.push({ file, rule, detail });
}

function forbidText(file, source, text, rule, detail) {
  if (source.includes(text)) violations.push({ file, rule, detail });
}

function forbidRegex(file, source, regex, rule, detail) {
  if (regex.test(source)) violations.push({ file, rule, detail });
}

const handlerPath = 'apps/api/src/transport/middleware/error-handler.ts';
const handler = read(handlerPath);
requireText(handlerPath, handler, 'AppError, DomainError', 'typed-errors', 'API error boundary must explicitly recognize both application and domain errors');
requireText(handlerPath, handler, 'error instanceof DomainError', 'domain-error-mapping', 'DomainError must not fall through to HTTP 500');
requireRegex(handlerPath, handler, /endsWith\(['"]_UNAUTHORIZED['"]\).*401/s, 'domain-unauthorized', 'domain unauthorized errors must map to HTTP 401');
requireRegex(handlerPath, handler, /endsWith\(['"]_FORBIDDEN['"]\).*403/s, 'domain-forbidden', 'domain forbidden errors must map to HTTP 403');
requireRegex(handlerPath, handler, /endsWith\(['"]_NOT_FOUND['"]\).*404/s, 'domain-not-found', 'domain not-found errors must map to HTTP 404');
requireRegex(handlerPath, handler, /endsWith\(['"]_CONFLICT['"]\).*409/s, 'domain-conflict', 'domain conflict errors must map to HTTP 409');
requireText(handlerPath, handler, "ResponseHelper.error('Invalid request data', 'VALIDATION_ERROR', traceId)", 'validation-containment', 'validation failures must return a stable client-safe message');
requireText(handlerPath, handler, "ResponseHelper.error('Internal Server Error', 'INTERNAL_SERVER_ERROR', traceId)", 'internal-containment', 'unhandled failures must return a stable client-safe message');
forbidText(handlerPath, handler, 'process.env.NODE_ENV', 'environment-leakage', 'client error containment must not weaken outside production');
forbidRegex(handlerPath, handler, /ResponseHelper\.error\(\s*error\.message\s*,\s*['"]VALIDATION_ERROR['"]/, 'validation-leakage', 'Fastify validation details must never be reflected to clients');
forbidRegex(handlerPath, handler, /const\s+message\s*=\s*isProd\s*\?/, 'internal-leakage', 'unhandled exception detail must never depend on production mode');

const appPath = 'apps/api/src/bootstrap/app.ts';
const app = read(appPath);
requireText(appPath, app, "ResponseHelper.error('Route not found', 'NOT_FOUND', request.traceId)", 'route-not-found', 'unknown routes must use a stable non-reflective response');
forbidRegex(appPath, app, /ResponseHelper\.error\([^\n]*request\.url/, 'route-reflection', 'raw request URLs must not be reflected in 404 response messages');

const testPath = 'tests/unit/api-error-boundary.behavior.test.ts';
const tests = read(testPath);
for (const proof of [
  'BOOKING_UNAUTHORIZED',
  'BOOKING_FORBIDDEN',
  'BOOKING_NOT_FOUND',
  'BOOKING_SLOT_CONFLICT',
  'BOOKING_INVALID_SLOT',
  'FORBIDDEN: You do not have permission',
  'Internal Server Error',
  'Invalid request data',
]) {
  requireText(testPath, tests, proof, 'runtime-proof', `error-boundary tests must prove ${proof}`);
}
requireText(testPath, tests, "not.toContain('secret')", 'leakage-proof', 'tests must prove secret-bearing exception detail is not returned');

violations.sort((a, b) => a.file.localeCompare(b.file) || a.rule.localeCompare(b.rule));
if (violations.length === 0) {
  console.log('[cw5-error-semantics-gate] PASS');
  process.exit(0);
}

console.log(`[cw5-error-semantics-gate] FAILED — ${violations.length} violation(s)`);
for (const violation of violations) {
  console.log(`- ${violation.file} [${violation.rule}]: ${violation.detail}`);
}
process.exit(1);
