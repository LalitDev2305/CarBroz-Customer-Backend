import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = (relative, content) => {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};

const bookingUseCases = path.join(root, 'domains/booking/application/BookingUseCases.ts');
if (!fs.existsSync(bookingUseCases)) throw new Error('Booking application file missing during last-mile closeout');

let source = fs.readFileSync(bookingUseCases, 'utf8');
const classStart = source.indexOf('export class AssignPartnerToBookingUseCase');
const nextBoundary = source.indexOf('export interface TransitionBookingStatusInput', classStart);
if (classStart >= 0) {
  if (nextBoundary <= classStart) throw new Error('Unable to locate deterministic boundary after Booking dispatch class');
  source = source.slice(0, classStart) + source.slice(nextBoundary);
}

source = source.replace(/^\/\*\*[^\n]*AssignPartnerToBookingUseCase[^\n]*\*\/\r?\n/m, '');
source = source.replace(/^import\s+type\s+\{[^\n}]*IPartnerRepository[^\n}]*\}\s+from\s+['"][^'"]+['"];?\r?\n/m, '');

const executableResidue = source.split(/\r?\n/).filter(
  (line) => line.includes('export class AssignPartnerToBookingUseCase') || line.includes('IPartnerRepository'),
);
if (executableResidue.length) {
  throw new Error(`Booking still retains executable dispatch/Partner repository authority after last-mile closeout:\n${executableResidue.join('\n')}`);
}
fs.writeFileSync(bookingUseCases, source);

const operationsDispatch = path.join(root, 'domains/operations/application/dispatch/AssignPartnerToBookingUseCase.ts');
const operationsPublic = path.join(root, 'domains/operations/public/index.ts');
if (!fs.existsSync(operationsDispatch)) throw new Error('Operations dispatch owner was not created');
if (!fs.existsSync(operationsPublic) || !fs.readFileSync(operationsPublic, 'utf8').includes('AssignPartnerToBookingUseCase')) {
  throw new Error('Operations dispatch owner is not publicly exposed');
}

write('tests/contracts/canonical-public-contracts.contract.test.ts', `import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const publicEntries = [
  'domains/identity/public/index.ts',
  'domains/partner/public/index.ts',
  'domains/customer/public/index.ts',
  'domains/catalog-pricing/public/index.ts',
  'domains/booking/public/index.ts',
  'domains/operations/public/index.ts',
  'domains/financials/public/index.ts',
  'domains/communications/public/index.ts',
  'domains/engagement/public/index.ts',
  'domains/configuration/public/index.ts',
  'domains/dispute/public/index.ts',
  'domains/enterprise/public/index.ts',
  'domains/audit/public/index.ts',
  'sdui/registry/public/index.ts',
] as const;

describe('canonical public contracts', () => {
  it('publishes deliberate bounded-context entry points without concrete infrastructure', () => {
    for (const entry of publicEntries) {
      const file = path.join(root, entry);
      expect(fs.existsSync(file)).toBe(true);
      const publicSource = fs.readFileSync(file, 'utf8');
      expect(publicSource).not.toContain('/infrastructure/');
      expect(publicSource).not.toContain('@prisma/client');
    }
  });

  it('keeps universal Money and strict ExecutionContext authority in Foundation', () => {
    const money = fs.readFileSync(path.join(root, 'foundation/kernel/src/domain/Money.ts'), 'utf8');
    const contracts = fs.readFileSync(path.join(root, 'foundation/kernel/src/application/contracts.ts'), 'utf8');
    expect(money).toContain('class Money');
    expect(money).toContain('amountMinor');
    expect(contracts).toContain('interface ExecutionContext');
    expect(contracts).toContain('actor: ActorContext');
    expect(contracts).toContain('id: number');
    expect(contracts).not.toContain('actor?:');
  });
});
`);

// The finalizer has completed before this helper runs. It is intentionally absent from the frozen
// repository, so remove it before lint/coverage inspect the final candidate rather than migration tooling.
fs.rmSync(path.join(root, 'tools/architecture-closeout-finalize.mjs'), { force: true });
fs.rmSync(path.join(root, 'tools/architecture-closeout-postfinal.mjs'), { force: true });

console.log('[architecture-closeout-lastmile] Booking dispatch ownership, public-contract test and temporary finalizer cleanup completed');
