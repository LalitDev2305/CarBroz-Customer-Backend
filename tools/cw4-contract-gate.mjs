import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const auditOnly = process.argv.includes('--audit');
const violations = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function walk(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const relative = path.posix.join(relativeDir, entry.name);
    if (entry.isDirectory()) files.push(...walk(relative));
    else if (entry.isFile() && relative.endsWith('.ts')) files.push(relative);
  }
  return files;
}

function add(file, rule, detail) {
  violations.push({ file, rule, detail });
}

const contractsPath = 'foundation/kernel/src/application/contracts.ts';
const contracts = read(contractsPath);
if (/execute\(input:\s*TInput,\s*context\?:\s*ExecutionContext\)/.test(contracts)) {
  add(contractsPath, 'execution-context', 'IUseCase.execute makes ExecutionContext optional');
}
if (/type\s+TransactionContext\s*=\s*unknown/.test(contracts)) {
  add(contractsPath, 'transaction-contract', 'TransactionContext is unknown instead of a stable transaction-bound context');
}
if (/work:\s*\(transaction\?:\s*TransactionContext\)/.test(contracts)) {
  add(contractsPath, 'transaction-contract', 'transaction callback receives an optional transaction context');
}

const domainFiles = walk('domains');
for (const file of domainFiles) {
  const normalized = file.replaceAll('\\', '/');
  const semanticLayer = normalized.includes('/domain/') || normalized.includes('/application/') || normalized.includes('/use-cases/');
  if (!semanticLayer) continue;
  const source = read(file);

  if (/\bDate\.now\s*\(/.test(source) || /\bnew\s+Date\s*\(\s*\)/.test(source)) {
    add(file, 'clock', 'domain/application code reads wall-clock time directly instead of an injected Clock');
  }
  if (/throw\s+new\s+Error\s*\(/.test(source)) {
    add(file, 'typed-errors', 'expected domain/application failures use generic Error');
  }
}

const bookingUseCasesPath = 'domains/booking/application/BookingUseCases.ts';
if (fs.existsSync(path.join(root, bookingUseCasesPath))) {
  const source = read(bookingUseCasesPath);
  if (/\bactorId\s*:\s*number/.test(source) || /\bisAdmin\??\s*:\s*boolean/.test(source)) {
    add(bookingUseCasesPath, 'execution-context', 'booking authorization/state commands accept raw actorId/isAdmin authority instead of ExecutionContext.actor');
  }
  if (/runInTransaction<T>\(work:\s*\(\)\s*=>\s*Promise<T>\)/.test(source)) {
    add(bookingUseCasesPath, 'transaction-contract', 'booking transaction port does not expose the transaction-bound context');
  }
  if (/findConflictingSlotBooking[\s\S]*runInTransaction\(\(\)\s*=>\s*this\.bookingRepository\.create/.test(source)) {
    add(bookingUseCasesPath, 'transaction-atomicity', 'slot conflict check occurs outside the transaction that creates the booking');
  }
  if (/for\s*\(const\s+booking\s+of\s+expired\)[\s\S]*bookingRepository\.update/.test(source) && !/ExpirePendingBookingsUseCase[\s\S]*runInTransaction/.test(source)) {
    add(bookingUseCasesPath, 'transaction-atomicity', 'batch expiry performs multiple writes without an explicit transaction boundary');
  }
}

const bookingDomainPath = 'domains/booking/domain/Booking.ts';
if (fs.existsSync(path.join(root, bookingDomainPath))) {
  const source = read(bookingDomainPath);
  if (/confirm\(actorId:\s*number\)[\s\S]*new\s+Date\s*\(\s*\)/.test(source)) {
    add(bookingDomainPath, 'clock', 'confirm() decides expiry from wall-clock time instead of receiving time explicitly');
  }
  if (/timestamp:\s*new\s+Date\s*\(\s*\)/.test(source)) {
    add(bookingDomainPath, 'clock', 'booking status history timestamps are generated inside the aggregate from wall-clock time');
  }
}

violations.sort((a, b) => a.file.localeCompare(b.file) || a.rule.localeCompare(b.rule));

if (violations.length === 0) {
  console.log('[cw4-contract-gate] PASS');
  process.exit(0);
}

console.log(`[cw4-contract-gate] ${auditOnly ? 'AUDIT' : 'FAILED'} — ${violations.length} contract violation(s)`);
for (const violation of violations) {
  console.log(`- ${violation.file} [${violation.rule}]: ${violation.detail}`);
}

if (auditOnly) {
  console.log('[cw4-contract-gate] audit mode does not fail CI; remove --audit only after CW4 convergence');
  process.exit(0);
}
process.exit(1);
