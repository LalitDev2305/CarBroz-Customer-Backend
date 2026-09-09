import fs from 'node:fs';
import path from 'node:path';

/**
 * Constitution §45 permanent regression gate.
 *
 * Proves metadata-first request logging, recursive sensitive-field redaction, absence of direct
 * console logging in executable production sources, and observable provider-failure handling for
 * the implemented MSG91 delivery adapter. This verifier is deterministic and read-only.
 */
const root = process.cwd();
const violations = [];

function absolute(relative) {
  return path.join(root, relative);
}

function required(relative, reason) {
  if (!fs.existsSync(absolute(relative))) violations.push(`${relative}: ${reason}`);
}

function read(relative) {
  const file = absolute(relative);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist', 'generated', '.git', 'coverage'].includes(entry.name)) return [];
    const candidate = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(candidate) : [candidate];
  });
}

function relative(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

function executableTypeScriptFiles(base) {
  return walk(absolute(base)).filter((file) =>
    /\.(?:ts|mts|cts)$/.test(file) && !/\.(?:spec|test)\.[cm]?ts$/.test(file),
  );
}

for (const file of [
  'platform/observability/src/index.ts',
  'platform/observability/src/adapters/LoggerProvider.ts',
  'platform/observability/tests/logger-redaction.spec.ts',
  'apps/api/src/bootstrap/lifecycle/request-flow.plugin.ts',
  'domains/audit/application/AuditLogService.ts',
  'platform/integrations/src/communications/Msg91SmsProvider.ts',
  'platform/integrations/src/communications/Msg91SmsProvider.spec.ts',
]) required(file, 'Constitution §45 evidence is missing');

const observability = read('platform/observability/src/index.ts');
for (const marker of [
  'SENSITIVE_KEY_NAMES',
  'SENSITIVE_PATHS',
  'redactSensitiveMetadata',
  "return { name: value.name }",
  'formatters: { log: sanitizeLogObject }',
  "'phonenumber'", "'email'", "'address'", "'coordinates'", "'latitude'", "'longitude'",
  "'kyc'", "'documentnumber'", "'cardnumber'", "'upiid'", "'bankaccount'",
  "'apikey'", "'authkey'", "'accesskey'", "'secretkey'", "'keysecret'", "'credentials'",
  "'body'", "'payload'", "'rawbody'",
  'interface FlowLogFields',
]) {
  if (!observability.includes(marker)) {
    violations.push(`platform/observability/src/index.ts: missing §45 privacy marker ${marker}`);
  }
}

const requestFlow = read('apps/api/src/bootstrap/lifecycle/request-flow.plugin.ts');
for (const marker of [
  'http.request.started', 'http.request.failed', 'http.request.completed',
  'correlationId', 'method', 'route', 'statusCode', 'durationMs', 'errorCode',
  "request.url.split('?')[0]",
]) {
  if (!requestFlow.includes(marker)) {
    violations.push(`apps/api/src/bootstrap/lifecycle/request-flow.plugin.ts: missing metadata-first marker ${marker}`);
  }
}
for (const forbidden of ['request.body', 'request.headers', 'request.query', 'reply.getHeaders(']) {
  if (requestFlow.includes(forbidden)) {
    violations.push(`apps/api/src/bootstrap/lifecycle/request-flow.plugin.ts: request lifecycle logging must not dump ${forbidden}`);
  }
}

const auditLogService = read('domains/audit/application/AuditLogService.ts');
if (!auditLogService.includes("this.logger.error('audit.persistence.failed'")) {
  violations.push('domains/audit/application/AuditLogService.ts: audit persistence failures must emit canonical observability metadata');
}

const msg91 = read('platform/integrations/src/communications/Msg91SmsProvider.ts');
for (const marker of [
  'ILoggerProvider',
  'provider.sms.msg91.configuration_missing',
  'provider.sms.msg91.http_failed',
  'provider.sms.msg91.invalid_response',
  'provider.sms.msg91.provider_rejected',
  'provider.sms.msg91.unavailable',
  'provider.sms.msg91.delivery_configuration_missing',
  "provider: 'MSG91'",
  "operation: 'sendSms'",
  'errorCode',
]) {
  if (!msg91.includes(marker)) {
    violations.push(`platform/integrations/src/communications/Msg91SmsProvider.ts: missing provider-failure observability marker ${marker}`);
  }
}
if (/\.json\(\)\.catch\(\(\)\s*=>\s*null\)/.test(msg91)) {
  violations.push('platform/integrations/src/communications/Msg91SmsProvider.ts: malformed provider responses are silently discarded');
}

for (const base of ['apps', 'domains', 'sdui', 'platform', 'foundation']) {
  for (const file of executableTypeScriptFiles(base)) {
    const content = fs.readFileSync(file, 'utf8');
    const rel = relative(file);
    if (/\bconsole\.(?:log|debug|info|warn|error)\s*\(/.test(content)) {
      violations.push(`${rel}: direct console logging bypasses canonical observability`);
    }
    if (/catch\s*(?:\([^)]*\))?\s*\{\s*\}/s.test(content)) {
      violations.push(`${rel}: empty catch silently discards a failure`);
    }
    if (/\.catch\(\s*\(\)\s*=>\s*(?:null|undefined)\s*\)/s.test(content)) {
      violations.push(`${rel}: promise rejection is silently discarded`);
    }
  }
}

if (violations.length) {
  console.error('[cw5-observability-pii-gate] CONSTITUTION §45 VERIFICATION FAILED');
  for (const violation of [...new Set(violations)].sort()) console.error(`- ${violation}`);
  process.exit(1);
}

console.log('[cw5-observability-pii-gate] PASS: metadata-first logging, sensitive-field redaction and implemented provider-failure observability comply with Constitution §45');
