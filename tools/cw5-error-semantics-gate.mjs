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

const responsePath = 'apps/api/src/transport/response/ResponseHelper.ts';
const response = read(responsePath);
requireText(responsePath, response, "| 'SERVICE_UNAVAILABLE'", 'service-unavailable-code', 'canonical envelope must support SERVICE_UNAVAILABLE');
requireRegex(responsePath, response, /ApiResponseStatus\s*=\s*[^;]*503/, 'service-unavailable-status', 'canonical response status union must support HTTP 503');
requireText(responsePath, response, "503: 'SERVICE_UNAVAILABLE'", 'service-unavailable-map', 'HTTP 503 must have a stable default code');
requireRegex(responsePath, response, /static\s+created[\s\S]*ResponseHelper\.success/, 'creation-policy', 'frozen creation policy must remain HTTP 200 through success()');
requireRegex(responsePath, response, /static\s+noContent\(\):\s*void/, 'no-content-policy', 'HTTP 204 helper must return no body');
requireRegex(responsePath, response, /static\s+error\([\s\S]*code:\s*string\s*=\s*RESPONSE_CODE_BY_STATUS\[status\]/, 'specific-error-code', 'error envelope must allow typed application/domain codes while retaining status defaults');

const handlerPath = 'apps/api/src/transport/middleware/error-handler.ts';
const handler = read(handlerPath);
requireText(handlerPath, handler, 'AppError, DomainError', 'typed-errors', 'API error boundary must explicitly recognize both application and domain errors');
requireText(handlerPath, handler, 'error instanceof DomainError', 'domain-error-mapping', 'DomainError must not fall through to HTTP 500');
requireRegex(handlerPath, handler, /endsWith\(['"]_UNAUTHORIZED['"]\).*401/s, 'domain-unauthorized', 'domain unauthorized errors must map to HTTP 401');
requireRegex(handlerPath, handler, /endsWith\(['"]_FORBIDDEN['"]\).*403/s, 'domain-forbidden', 'domain forbidden errors must map to HTTP 403');
requireRegex(handlerPath, handler, /endsWith\(['"]_NOT_FOUND['"]\).*404/s, 'domain-not-found', 'domain not-found errors must map to HTTP 404');
requireRegex(handlerPath, handler, /endsWith\(['"]_CONFLICT['"]\).*409/s, 'domain-conflict', 'domain conflict errors must map to HTTP 409');
requireText(handlerPath, handler, "const SAFE_VALIDATION_MESSAGE = 'The request contains invalid information.'", 'validation-containment', 'validation failures must use one stable client-safe message');
requireText(handlerPath, handler, "const SAFE_INTERNAL_MESSAGE = 'Something went wrong. Please try again later.'", 'internal-containment', 'unhandled/server failures must use one stable client-safe message');
requireRegex(handlerPath, handler, /case\s+503:/, 'application-503', 'typed application failures must be able to retain HTTP 503');
requireText(handlerPath, handler, "ResponseHelper.error(400, SAFE_VALIDATION_MESSAGE, traceId, 'VALIDATION_ERROR')", 'validation-code', 'validation failures must use stable VALIDATION_ERROR code');
requireText(handlerPath, handler, "ResponseHelper.error(500, SAFE_INTERNAL_MESSAGE, traceId, 'INTERNAL_SERVER_ERROR')", 'internal-code', 'unhandled failures must use stable INTERNAL_SERVER_ERROR code');
forbidText(handlerPath, handler, 'process.env.NODE_ENV', 'environment-leakage', 'client error containment must not weaken outside production');
forbidRegex(handlerPath, handler, /ResponseHelper\.error\([^\n]*error\.message[^\n]*VALIDATION_ERROR/, 'validation-leakage', 'Fastify validation details must never be reflected to clients');

const appPath = 'apps/api/src/bootstrap/app.ts';
const app = read(appPath);
requireText(appPath, app, "ResponseHelper.error(404, 'The requested route could not be found.', request.traceId)", 'route-not-found', 'unknown routes must use the canonical non-reflective 404 envelope');
forbidRegex(appPath, app, /ResponseHelper\.error\([^\n]*request\.url/, 'route-reflection', 'raw request URLs must not be reflected in 404 response messages');

const helperTestPath = 'apps/api/src/transport/response/ResponseHelper.test.ts';
const helperTests = read(helperTestPath);
for (const proof of [
  "[503, 'SERVICE_UNAVAILABLE']",
  "'BOOKING_SLOT_CONFLICT'",
  'ResponseHelper.created',
  'ResponseHelper.noContent',
]) {
  requireText(helperTestPath, helperTests, proof, 'helper-runtime-proof', `ResponseHelper tests must prove ${proof}`);
}

const boundaryTestPath = 'tests/unit/api-error-boundary.behavior.test.ts';
const boundaryTests = read(boundaryTestPath);
for (const proof of [
  'BOOKING_UNAUTHORIZED',
  'BOOKING_FORBIDDEN',
  'BOOKING_NOT_FOUND',
  'BOOKING_SLOT_CONFLICT',
  'BOOKING_INVALID_SLOT',
  'OTP_PERSISTENCE_UNAVAILABLE',
  "code: 'VALIDATION_ERROR'",
  "code: 'INTERNAL_SERVER_ERROR'",
  "message: 'Something went wrong. Please try again later.'",
  "message: 'The request contains invalid information.'",
]) {
  requireText(boundaryTestPath, boundaryTests, proof, 'runtime-proof', `error-boundary tests must prove ${proof}`);
}
requireText(boundaryTestPath, boundaryTests, "not.toContain('secret')", 'leakage-proof', 'tests must prove secret-bearing exception detail is not returned');
requireText(boundaryTestPath, boundaryTests, 'data: null', 'canonical-envelope-proof', 'tests must prove mapped failures use data:null');

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
