import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

/**
 * Constitution §44 permanent regression gate.
 *
 * Proves that technical environment/secrets remain outside persisted business Configuration,
 * production bootstrap rejects known unsafe/default values, development-only provider fallbacks
 * cannot silently run in production, and committed env material is limited to `.env.example`.
 * This verifier is read-only and intentionally independent from application imports.
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
  if (!fs.existsSync(file)) return '';
  return fs.readFileSync(file, 'utf8');
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

function executableTypeScriptFiles(relativeRoot) {
  return walk(absolute(relativeRoot)).filter((file) =>
    /\.(?:ts|mts|cts)$/.test(file) && !/\.(?:spec|test)\.[cm]?ts$/.test(file),
  );
}

for (const file of [
  '.env.example',
  'apps/api/src/bootstrap/config/runtime-config.ts',
  'apps/api/src/bootstrap/config/runtime-config.spec.ts',
  'platform/integrations/src/maps/GoogleMapsProvider.ts',
  'platform/integrations/src/maps/GoogleMapsProvider.spec.ts',
  'platform/integrations/src/payment/RazorpayPaymentGatewayProvider.ts',
  'platform/integrations/src/payment/RazorpayPaymentGatewayProvider.spec.ts',
  'platform/storage/src/providers/MinIOStorageProvider.ts',
  'platform/storage/tests/minio-storage-provider.spec.ts',
]) required(file, 'Constitution §44 evidence is missing');

const runtimeConfig = read('apps/api/src/bootstrap/config/runtime-config.ts');
for (const marker of [
  'export function parseRuntimeConfig',
  'RuntimeConfigError',
  'DATABASE_URL must use PostgreSQL',
  'Production DATABASE_URL must not use localhost',
  'Production REDIS_URL must not use localhost',
  'Production JWT_SECRET must not use a known placeholder/default value',
  'Production object storage must use TLS',
  'Production SMS provider credentials must not use a placeholder',
  'Production MAPS_API_KEY must be a real provider credential',
  'Production RAZORPAY_KEY_ID must be a live provider credential',
  'Production RAZORPAY_KEY_SECRET must be a real provider credential',
  "normalized === 'false'",
]) {
  if (!runtimeConfig.includes(marker)) {
    violations.push(`apps/api/src/bootstrap/config/runtime-config.ts: missing §44 marker ${marker}`);
  }
}
if (/\bprocess\.exit\s*\(/.test(runtimeConfig)) {
  violations.push('apps/api/src/bootstrap/config/runtime-config.ts: reusable configuration must not exit the process during import');
}
if (/\bconsole\.(?:log|debug|info|warn|error)\s*\(/.test(runtimeConfig)) {
  violations.push('apps/api/src/bootstrap/config/runtime-config.ts: runtime configuration bypasses canonical observability');
}
if (/MINIO_USE_SSL:\s*z\.coerce\.boolean/.test(runtimeConfig)) {
  violations.push('apps/api/src/bootstrap/config/runtime-config.ts: string "false" must not be coerced to boolean true');
}

const technicalConfigNames = [
  'DATABASE_URL', 'REDIS_URL', 'JWT_SECRET',
  'MINIO_ENDPOINT', 'MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY',
  'MSG91_AUTH_KEY', 'MSG91_OTP_TEMPLATE_ID', 'MSG91_OTP_VARIABLE_NAME',
  'MAPS_API_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET',
];
for (const file of executableTypeScriptFiles('domains/configuration')) {
  const content = fs.readFileSync(file, 'utf8');
  if (/\bprocess\.env\b/.test(content)) {
    violations.push(`${relative(file)}: persisted business Configuration must not read process.env`);
  }
  for (const key of technicalConfigNames) {
    if (content.includes(key)) {
      violations.push(`${relative(file)}: technical secret/environment key ${key} leaked into persisted business Configuration`);
    }
  }
}

for (const providerFile of [
  'platform/integrations/src/maps/GoogleMapsProvider.ts',
  'platform/storage/src/providers/MinIOStorageProvider.ts',
]) {
  const content = read(providerFile);
  if (content.includes('@carbroz/domain-configuration') || /\bIConfigProvider\b/.test(content)) {
    violations.push(`${providerFile}: technical provider secrets must not come from persisted business Configuration`);
  }
}

const mapsProvider = read('platform/integrations/src/maps/GoogleMapsProvider.ts');
for (const marker of [
  "process.env.NODE_ENV !== 'production'",
  'Google Maps provider integration is not implemented',
]) {
  if (!mapsProvider.includes(marker)) {
    violations.push(`platform/integrations/src/maps/GoogleMapsProvider.ts: missing production no-mock marker ${marker}`);
  }
}

const storageProvider = read('platform/storage/src/providers/MinIOStorageProvider.ts');
for (const marker of [
  "process.env.NODE_ENV === 'production'",
  'Production storage configuration is incomplete',
  'falling back to mock storage',
]) {
  if (!storageProvider.includes(marker)) {
    violations.push(`platform/storage/src/providers/MinIOStorageProvider.ts: missing production storage guard ${marker}`);
  }
}

const razorpayProvider = read('platform/integrations/src/payment/RazorpayPaymentGatewayProvider.ts');
for (const marker of [
  "process.env.NODE_ENV === 'production'",
  'Production Razorpay configuration is incomplete',
  'Production Razorpay configuration must use live credentials',
  '/^rzp_test_/i',
]) {
  if (!razorpayProvider.includes(marker)) {
    violations.push(`platform/integrations/src/payment/RazorpayPaymentGatewayProvider.ts: missing production credential guard ${marker}`);
  }
}

const example = read('.env.example');
for (const key of technicalConfigNames) {
  if (!new RegExp(`^${key}=`, 'm').test(example)) {
    violations.push(`.env.example: missing technical configuration template ${key}`);
  }
}

try {
  const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean);
  for (const file of tracked) {
    const basename = path.posix.basename(file);
    if ((basename === '.env' || basename.startsWith('.env.')) && basename !== '.env.example') {
      violations.push(`${file}: only .env.example may be committed as a general environment file`);
    }
  }
} catch (error) {
  violations.push(`git environment-file verification failed: ${error instanceof Error ? error.message : String(error)}`);
}

if (violations.length) {
  console.error('[cw5-runtime-config-gate] CONSTITUTION §44 VERIFICATION FAILED');
  for (const violation of [...new Set(violations)].sort()) console.error(`- ${violation}`);
  process.exit(1);
}

console.log('[cw5-runtime-config-gate] PASS: technical secrets, production defaults, provider fallback boundaries and committed env files comply with Constitution §44');
