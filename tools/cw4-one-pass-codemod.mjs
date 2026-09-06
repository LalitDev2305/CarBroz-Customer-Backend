import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (relative) => path.join(root, relative);
const read = (relative) => fs.readFileSync(p(relative), 'utf8');
const write = (relative, content) => {
  fs.mkdirSync(path.dirname(p(relative)), { recursive: true });
  fs.writeFileSync(p(relative), content);
};

function walk(relativeDir) {
  const absolute = p(relativeDir);
  if (!fs.existsSync(absolute)) return [];
  const files = [];
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const relative = path.posix.join(relativeDir, entry.name);
    if (entry.isDirectory()) files.push(...walk(relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

function ensureImport(source, names) {
  const needed = names.filter((name) => !new RegExp(`\\b${name}\\b`).test(source));
  if (!needed.length) return source;
  return `import { ${needed.join(', ')} } from '@carbroz/foundation-kernel';\n${source}`;
}

// Foundation: stable actor/execution/transaction/clock contracts.
write('foundation/kernel/src/application/contracts.ts', `/** Stable actor kinds understood across bounded contexts. */
export type ActorKind = 'GUEST' | 'CUSTOMER' | 'PARTNER' | 'ADMIN' | 'SYSTEM';

/** Transport-neutral authenticated actor identity. */
export interface ActorContext {
  readonly id: number;
  readonly kind: ActorKind;
  readonly roles: readonly string[];
  readonly customerId?: number;
  readonly partnerId?: number;
  readonly tenantId?: string;
}

/** Transport-neutral execution metadata propagated across application boundaries. */
export interface ExecutionContext {
  readonly correlationId: string;
  readonly actor: ActorContext;
  readonly timestamp: Date;
}

export interface IUseCase<TInput, TOutput> {
  execute(input: TInput, context: ExecutionContext): Promise<TOutput>;
}

/** Opaque transaction-bound resource. Only infrastructure adapters may unwrap resource. */
export interface TransactionContext {
  readonly resource: object;
}

export interface ITransactionProvider {
  runInTransaction<T>(work: (transaction: TransactionContext) => Promise<T>): Promise<T>;
}

export interface IClockProvider { now(): Date }
export interface IIdGeneratorProvider { generate(): string }
`);

write('foundation/kernel/src/application/SystemClock.ts', `import type { IClockProvider } from './contracts.js';

/** Production wall-clock implementation behind the universal Clock port. */
export class SystemClock implements IClockProvider {
  now(): Date {
    return new Date();
  }
}

/** Shared stateless production Clock implementation. */
export const systemClock: IClockProvider = new SystemClock();
`);

let foundationPublic = read('foundation/kernel/src/public/index.ts');
if (!foundationPublic.includes("../application/SystemClock.js")) {
  foundationPublic += "\nexport * from '../application/SystemClock.js';\n";
}
write('foundation/kernel/src/public/index.ts', foundationPublic);

let domainError = read('foundation/kernel/src/domain/errors/DomainError.ts');
domainError = domainError.replace('export abstract class DomainError extends Error', 'export class DomainError extends Error');
write('foundation/kernel/src/domain/errors/DomainError.ts', domainError);

// All bounded contexts legitimately depend on Foundation for typed errors / Clock contracts.
for (const entry of fs.readdirSync(p('domains'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const packagePath = `domains/${entry.name}/package.json`;
  if (!fs.existsSync(p(packagePath))) continue;
  const pkg = JSON.parse(read(packagePath));
  pkg.dependencies ??= {};
  pkg.dependencies['@carbroz/foundation-kernel'] = 'workspace:*';
  pkg.dependencies = Object.fromEntries(Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b)));
  write(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
}

// Domain-wide semantic debt: generic expected failures -> typed DomainError;
// direct business wall-clock reads -> Foundation Clock abstraction.
for (const file of walk('domains').filter((f) => f.endsWith('.ts'))) {
  const normalized = file.replaceAll('\\\\', '/');
  const semantic = normalized.includes('/domain/') || normalized.includes('/application/') || normalized.includes('/use-cases/');
  if (!semantic) continue;
  let source = read(file);
  const needsError = /throw\s+new\s+Error\s*\(/.test(source);
  const needsClock = /\bDate\.now\s*\(/.test(source) || /\bnew\s+Date\s*\(\s*\)/.test(source);
  if (needsError) source = source.replace(/throw\s+new\s+Error\s*\(/g, 'throw new DomainError(');
  if (needsClock) {
    source = source.replace(/\bDate\.now\s*\(\s*\)/g, 'systemClock.now().getTime()');
    source = source.replace(/\bnew\s+Date\s*\(\s*\)/g, 'systemClock.now()');
  }
  const imports = [];
  if (needsError && !/import[^;]*\bDomainError\b/.test(source)) imports.push('DomainError');
  if (needsClock && !/import[^;]*\bsystemClock\b/.test(source)) imports.push('systemClock');
  if (imports.length) source = `import { ${imports.join(', ')} } from '@carbroz/foundation-kernel';\n${source}`;
  write(file, source);
}

// Booking owns explicit booking-state policy while authority comes from ExecutionContext.
write('domains/booking/application/BookingUseCases.ts', `import { DomainError, type ExecutionContext, type TransactionContext, systemClock } from '@carbroz/foundation-kernel';
import { Booking } from '../domain/Booking.js';
import type { BookingSnapshots } from '../domain/BookingSnapshots.js';
import type { BookingStatus } from '../domain/BookingStatus.js';
import type { IBookingRepository } from '../domain/repositories/IBookingRepository.js';
import type { IAddressRepository, ICustomerProfileRepository, IVehicleRepository } from '@carbroz/domain-customer';
import type { ICatalogRepository, IPricingRepository, ServiceAddon } from '@carbroz/domain-catalog-pricing';

/** Booking-owned view of the universal transaction contract. */
export interface IBookingTransactionPort {
  runInTransaction<T>(work: (transaction: TransactionContext) => Promise<T>): Promise<T>;
}

export interface IPayoutEligibilityPort {
  execute(bookingId: number): Promise<unknown>;
}

export interface CreateBookingInput {
  /** Compatibility assertion only; authenticated authority comes from ExecutionContext.actor. */
  customerId?: number;
  vehicleId: number;
  addressId: number;
  serviceId: number;
  addonIds?: number[];
  slotStartTime: Date;
  slotEndTime: Date;
}

async function resolveCustomerId(
  context: ExecutionContext,
  customerRepository: ICustomerProfileRepository,
): Promise<number> {
  if (context.actor.kind !== 'CUSTOMER') throw new DomainError('Customer authority is required', 'BOOKING_FORBIDDEN');
  if (context.actor.customerId) return context.actor.customerId;
  const profile = await customerRepository.findByUserId(context.actor.id);
  if (!profile?.id) throw new DomainError('Customer profile not found', 'BOOKING_CUSTOMER_NOT_FOUND');
  return profile.id;
}

export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly vehicleRepository: IVehicleRepository,
    private readonly addressRepository: IAddressRepository,
    private readonly catalogRepository: ICatalogRepository,
    private readonly pricingRepository: IPricingRepository,
    private readonly customerRepository: ICustomerProfileRepository,
    private readonly transactionProvider: IBookingTransactionPort,
  ) {}

  async execute(input: CreateBookingInput, context: ExecutionContext): Promise<Booking> {
    const customerId = await resolveCustomerId(context, this.customerRepository);
    if (input.customerId !== undefined && input.customerId !== customerId) {
      throw new DomainError('Booking customer does not match authenticated customer', 'BOOKING_FORBIDDEN');
    }

    const now = systemClock.now();
    const slotStartTime = new Date(input.slotStartTime);
    const slotEndTime = new Date(input.slotEndTime);
    if (slotStartTime <= now) throw new DomainError('Slot start time must be in the future', 'BOOKING_INVALID_SLOT');
    if (slotEndTime <= slotStartTime) throw new DomainError('Slot end time must be after slot start time', 'BOOKING_INVALID_SLOT');

    const vehicle = await this.vehicleRepository.findById(input.vehicleId);
    if (!vehicle || vehicle.customerId !== customerId || !vehicle.isBookable()) {
      throw new DomainError('Invalid or non-bookable vehicle', 'BOOKING_INVALID_VEHICLE');
    }

    const address = await this.addressRepository.findById(input.addressId);
    if (!address) throw new DomainError('Address not found', 'BOOKING_ADDRESS_NOT_FOUND');

    const service = await this.catalogRepository.findServiceById(input.serviceId);
    if (!service || !service.isActive) throw new DomainError('Service not found or inactive', 'BOOKING_SERVICE_UNAVAILABLE');

    let basePricePaise = service.basePrice;
    const defaultTier = await this.pricingRepository.findDefaultTierByServiceId(input.serviceId);
    if (defaultTier) basePricePaise = defaultTier.flatPrice;

    const vehicleMultiplier = await this.pricingRepository.findVehicleMultiplier(input.serviceId, vehicle.fuelType);
    const multiplierValue = vehicleMultiplier?.multiplier ?? 1;

    let addonsTotalPaise = 0;
    const addonSnapshots: BookingSnapshots['addons'] = [];
    if (input.addonIds?.length) {
      const activeAddons = await this.catalogRepository.findAddonsByServiceId(input.serviceId);
      for (const addonId of input.addonIds) {
        const found = activeAddons.find((addon: ServiceAddon) => addon.id === addonId && addon.isActive);
        if (!found) continue;
        addonsTotalPaise += found.price;
        addonSnapshots.push({ addonId: found.id!, name: found.name, pricePaise: found.price });
      }
    }

    const subtotalPaise = Math.round(basePricePaise * multiplierValue) + addonsTotalPaise;
    const taxesPaise = Math.round(subtotalPaise * 0.18);
    const totalPricePaise = subtotalPaise + taxesPaise;
    const snapshots: BookingSnapshots = {
      service: { serviceId: service.id!, name: service.name, basePricePaise, estimatedDurationMinutes: service.estimatedDurationMinutes },
      addons: addonSnapshots,
      pricing: { basePricePaise, addonsTotalPaise, vehicleMultiplier: multiplierValue, subtotalPaise, taxesPaise, totalPricePaise },
      address: {
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        latitude: address.latitude,
        longitude: address.longitude,
      },
      vehicle: {
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant,
        year: vehicle.year,
        registrationNumber: vehicle.registrationNumber,
        fuelType: vehicle.fuelType,
      },
    };

    const booking = new Booking({
      customerId,
      vehicleId: input.vehicleId,
      addressId: input.addressId,
      serviceId: input.serviceId,
      status: 'CREATED',
      slotStartTime,
      slotEndTime,
      expiryAt: new Date(now.getTime() + 15 * 60 * 1000),
      totalPricePaise,
      snapshots,
    });

    return this.transactionProvider.runInTransaction(async (transaction) => {
      const conflicting = await this.bookingRepository.findConflictingSlotBooking(
        input.serviceId,
        slotStartTime,
        slotEndTime,
        transaction,
      );
      if (conflicting) throw new DomainError('Selected service slot is no longer available', 'BOOKING_SLOT_CONFLICT');
      return this.bookingRepository.create(booking, transaction);
    });
  }
}

export class ConfirmBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly customerRepository: ICustomerProfileRepository,
  ) {}

  async execute(bookingPublicId: string, context: ExecutionContext): Promise<Booking> {
    const customerId = await resolveCustomerId(context, this.customerRepository);
    const booking = await this.bookingRepository.findByPublicId(bookingPublicId);
    if (!booking || booking.customerId !== customerId) throw new DomainError('Booking not found or unauthorized', 'BOOKING_NOT_FOUND');
    booking.confirm(context.actor.id);
    return this.bookingRepository.update(booking);
  }
}

export interface TransitionBookingStatusInput {
  bookingPublicId: string;
  targetStatus: BookingStatus;
}

export class TransitionBookingStatusUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly createPayoutEligibilityUseCase?: IPayoutEligibilityPort,
  ) {}

  async execute(input: TransitionBookingStatusInput, context: ExecutionContext): Promise<Booking> {
    const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
    if (!booking) throw new DomainError('Booking not found', 'BOOKING_NOT_FOUND');
    if (context.actor.kind !== 'ADMIN') {
      if (context.actor.kind !== 'PARTNER' || !context.actor.partnerId || context.actor.partnerId !== booking.partnerId) {
        throw new DomainError('Assigned partner authority is required', 'BOOKING_FORBIDDEN');
      }
    }
    if (input.targetStatus === 'IN_PROGRESS') booking.startService(context.actor.id);
    else if (input.targetStatus === 'COMPLETED') booking.completeService(context.actor.id);
    else throw new DomainError(`Unsupported direct transition to ${input.targetStatus}`, 'BOOKING_INVALID_TRANSITION');

    const updated = await this.bookingRepository.update(booking);
    if (input.targetStatus === 'COMPLETED' && this.createPayoutEligibilityUseCase) {
      await this.createPayoutEligibilityUseCase.execute(booking.id!);
    }
    return updated;
  }
}

export interface CancelBookingInput {
  bookingPublicId: string;
  reason: string;
}

export class CancelBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly customerRepository: ICustomerProfileRepository,
  ) {}

  async execute(input: CancelBookingInput, context: ExecutionContext): Promise<Booking> {
    if (!input.reason?.trim()) throw new DomainError('Cancellation reason is required', 'BOOKING_CANCELLATION_REASON_REQUIRED');
    const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
    if (!booking) throw new DomainError('Booking not found', 'BOOKING_NOT_FOUND');

    if (context.actor.kind !== 'ADMIN') {
      const customerId = await resolveCustomerId(context, this.customerRepository);
      if (booking.customerId !== customerId) throw new DomainError('Unauthorized to cancel this booking', 'BOOKING_FORBIDDEN');
    }
    booking.cancel(context.actor.id, input.reason);
    return this.bookingRepository.update(booking);
  }
}

export class ExpirePendingBookingsUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly transactionProvider: IBookingTransactionPort,
  ) {}

  async execute(context: ExecutionContext): Promise<number> {
    if (context.actor.kind !== 'SYSTEM' && context.actor.kind !== 'ADMIN') {
      throw new DomainError('System authority is required to expire bookings', 'BOOKING_FORBIDDEN');
    }
    const now = systemClock.now();
    return this.transactionProvider.runInTransaction(async (transaction) => {
      const expired = await this.bookingRepository.findExpiredPendingBookings(now, transaction);
      for (const booking of expired) {
        booking.expire('SYSTEM');
        await this.bookingRepository.update(booking, transaction);
      }
      return expired.length;
    });
  }
}
`);

// Booking aggregate owns explicit state transitions; all business time comes through Clock.
let bookingDomain = read('domains/booking/domain/Booking.ts');
bookingDomain = bookingDomain.replace(/^import[^\n]*@carbroz\/foundation-kernel[^\n]*\n/gm, '');
bookingDomain = `import { DomainError, systemClock } from '@carbroz/foundation-kernel';\n${bookingDomain}`;
bookingDomain = bookingDomain.replace(/throw\s+new\s+Error\s*\(/g, 'throw new DomainError(');
bookingDomain = bookingDomain.replace(/\bnew\s+Date\s*\(\s*\)/g, 'systemClock.now()');
write('domains/booking/domain/Booking.ts', bookingDomain);

write('domains/booking/domain/repositories/IBookingRepository.ts', `import type { TransactionContext } from '@carbroz/foundation-kernel';
import type { Booking } from '../Booking.js';
import type { BookingStatus } from '../BookingStatus.js';

/** Canonical Booking persistence contract exposed through the Booking public boundary. */
export interface IBookingRepository {
  create(booking: Booking, transaction?: TransactionContext): Promise<Booking>;
  findById(id: number, transaction?: TransactionContext): Promise<Booking | null>;
  findByPublicId(publicId: string, transaction?: TransactionContext): Promise<Booking | null>;
  listByCustomerId(customerId: number, status?: BookingStatus, transaction?: TransactionContext): Promise<Booking[]>;
  listByPartnerId(partnerId: number, status?: BookingStatus, transaction?: TransactionContext): Promise<Booking[]>;
  listByCorporateAccountId(corporateAccountId: number, status?: BookingStatus, transaction?: TransactionContext): Promise<Booking[]>;
  listAll(status?: BookingStatus, limit?: number, offset?: number, transaction?: TransactionContext): Promise<Booking[]>;
  findConflictingPartnerBooking(partnerId: number, startTime: Date, endTime: Date, excludeBookingId?: number, transaction?: TransactionContext): Promise<Booking | null>;
  findConflictingSlotBooking(serviceId: number, startTime: Date, endTime: Date, transaction?: TransactionContext): Promise<Booking | null>;
  findExpiredPendingBookings(now: Date, transaction?: TransactionContext): Promise<Booking[]>;
  update(booking: Booking, transaction?: TransactionContext): Promise<Booking>;
}
`);

// Booking persistence adapter unwraps the opaque Foundation transaction only inside infrastructure.
let prismaRepo = read('domains/booking/infrastructure/repositories/PrismaBookingRepository.ts');
if (!prismaRepo.includes("TransactionContext")) prismaRepo = `import type { TransactionContext } from '@carbroz/foundation-kernel';\n${prismaRepo}`;
prismaRepo = prismaRepo.replace(
  '  private mapToDomain(record: BookingPersistenceRecord): Booking {',
  `  private client(transaction?: TransactionContext): BookingPersistenceClient {\n    return transaction ? (transaction.resource as BookingPersistenceClient) : this.prisma;\n  }\n\n  private mapToDomain(record: BookingPersistenceRecord): Booking {`,
);
prismaRepo = prismaRepo.replace('async create(booking: Booking): Promise<Booking> {', 'async create(booking: Booking, transaction?: TransactionContext): Promise<Booking> {');
prismaRepo = prismaRepo.replace('const record = await this.prisma.booking.create({', 'const record = await this.client(transaction).booking.create({');
prismaRepo = prismaRepo.replace('async findById(id: number): Promise<Booking | null> {', 'async findById(id: number, transaction?: TransactionContext): Promise<Booking | null> {');
prismaRepo = prismaRepo.replace('const record = await this.prisma.booking.findUnique({ where: { id } });', 'const record = await this.client(transaction).booking.findUnique({ where: { id } });');
prismaRepo = prismaRepo.replace('async findByPublicId(publicId: string): Promise<Booking | null> {', 'async findByPublicId(publicId: string, transaction?: TransactionContext): Promise<Booking | null> {');
prismaRepo = prismaRepo.replace('const record = await this.prisma.booking.findUnique({ where: { publicId } });', 'const record = await this.client(transaction).booking.findUnique({ where: { publicId } });');
prismaRepo = prismaRepo.replace('async listByCustomerId(customerId: number, status?: BookingStatus): Promise<Booking[]> {', 'async listByCustomerId(customerId: number, status?: BookingStatus, transaction?: TransactionContext): Promise<Booking[]> {');
prismaRepo = prismaRepo.replace('const records = await this.prisma.booking.findMany({\n      where: { customerId, status: status || undefined },', 'const records = await this.client(transaction).booking.findMany({\n      where: { customerId, status: status || undefined },');
prismaRepo = prismaRepo.replace('async listByPartnerId(partnerId: number, status?: BookingStatus): Promise<Booking[]> {', 'async listByPartnerId(partnerId: number, status?: BookingStatus, transaction?: TransactionContext): Promise<Booking[]> {');
prismaRepo = prismaRepo.replace('const records = await this.prisma.booking.findMany({\n      where: { partnerId, status: status || undefined },', 'const records = await this.client(transaction).booking.findMany({\n      where: { partnerId, status: status || undefined },');
prismaRepo = prismaRepo.replace('    status?: BookingStatus,\n  ): Promise<Booking[]> {\n    const records = await this.prisma.booking.findMany({\n      where: { corporateAccountId, status: status || undefined },', '    status?: BookingStatus,\n    transaction?: TransactionContext,\n  ): Promise<Booking[]> {\n    const records = await this.client(transaction).booking.findMany({\n      where: { corporateAccountId, status: status || undefined },');
prismaRepo = prismaRepo.replace('async listAll(status?: BookingStatus, limit = 50, offset = 0): Promise<Booking[]> {\n    const records = await this.prisma.booking.findMany({', 'async listAll(status?: BookingStatus, limit = 50, offset = 0, transaction?: TransactionContext): Promise<Booking[]> {\n    const records = await this.client(transaction).booking.findMany({');
prismaRepo = prismaRepo.replace('    excludeBookingId?: number,\n  ): Promise<Booking | null> {\n    const record = await this.prisma.booking.findFirst({', '    excludeBookingId?: number,\n    transaction?: TransactionContext,\n  ): Promise<Booking | null> {\n    const record = await this.client(transaction).booking.findFirst({');
prismaRepo = prismaRepo.replace('    endTime: Date,\n  ): Promise<Booking | null> {\n    const record = await this.prisma.booking.findFirst({\n      where: {\n        serviceId,', '    endTime: Date,\n    transaction?: TransactionContext,\n  ): Promise<Booking | null> {\n    const record = await this.client(transaction).booking.findFirst({\n      where: {\n        serviceId,');
prismaRepo = prismaRepo.replace('async findExpiredPendingBookings(now: Date): Promise<Booking[]> {\n    const records = await this.prisma.booking.findMany({', 'async findExpiredPendingBookings(now: Date, transaction?: TransactionContext): Promise<Booking[]> {\n    const records = await this.client(transaction).booking.findMany({');
prismaRepo = prismaRepo.replace('async update(booking: Booking): Promise<Booking> {\n    const record = await this.prisma.booking.update({', 'async update(booking: Booking, transaction?: TransactionContext): Promise<Booking> {\n    const record = await this.client(transaction).booking.update({');
write('domains/booking/infrastructure/repositories/PrismaBookingRepository.ts', prismaRepo);

write('platform/database/src/providers/PrismaTransactionProvider.ts', `import type { ITransactionProvider, TransactionContext } from '@carbroz/foundation-kernel';
import { PrismaProvider } from './PrismaProvider.js';

/** Prisma transaction infrastructure with a single opaque transaction-bound resource. */
export class PrismaTransactionProvider implements ITransactionProvider {
  constructor(private readonly prismaProvider: PrismaProvider) {}

  public async runInTransaction<T>(operation: (transaction: TransactionContext) => Promise<T>): Promise<T> {
    const client = this.prismaProvider.getClient();
    return client.$transaction(
      async (tx) => operation({ resource: tx }),
      { isolationLevel: 'Serializable' },
    );
  }
}
`);

// Strengthen CW4 gate: fail closed and require executable transaction-propagation evidence.
let gate = read('tools/cw4-contract-gate.mjs');
gate = gate.replace("const auditOnly = process.argv.includes('--audit');", "const auditOnly = false;");
gate = gate.replace("const violations = [];", `const violations = [];\n\nconst rollbackProof = 'tests/integration/booking-transaction-rollback.integration.test.ts';\nif (!fs.existsSync(path.join(root, rollbackProof))) {\n  violations.push({ file: rollbackProof, rule: 'transaction-rollback-proof', detail: 'real PostgreSQL rollback proof is missing' });\n} else {\n  const proof = fs.readFileSync(path.join(root, rollbackProof), 'utf8');\n  if (!/PrismaTransactionProvider/.test(proof) || !/PrismaBookingRepository/.test(proof) || !/rejects\\.toThrow/.test(proof) || !/toBeNull\\(\\)/.test(proof)) {\n    violations.push({ file: rollbackProof, rule: 'transaction-rollback-proof', detail: 'rollback proof must exercise the real provider + Booking repository and prove rolled-back persistence is absent' });\n  }\n}`);
gate = gate.replace("console.log(`[cw4-contract-gate] ${auditOnly ? 'AUDIT' : 'FAILED'} — ${violations.length} contract violation(s)`);", "console.log(`[cw4-contract-gate] FAILED — ${violations.length} contract violation(s)`);");
gate = gate.replace(/\nif \(auditOnly\) \{[\s\S]*?\n\}\nprocess\.exit\(1\);\s*$/, '\nprocess.exit(1);\n');
write('tools/cw4-contract-gate.mjs', gate);

// Permanent verification wiring: CW4 is fail-closed before and after broader validation.
for (const workflowPath of ['.github/workflows/ci.yml', '.github/workflows/architecture-closeout.yml']) {
  let workflow = read(workflowPath);
  workflow = workflow.replace(/- name: Audit CW4 domain\/application contract convergence\n\s+run: node tools\/cw4-contract-gate\.mjs --audit/g, '- name: Verify CW4 domain/application contract convergence\n        run: node tools/cw4-contract-gate.mjs');
  if (!workflow.includes('Re-verify CW4 domain/application contract convergence')) {
    const anchor = '      - name: Prove validation is non-mutating';
    workflow = workflow.replace(anchor, `      - name: Re-verify CW4 domain/application contract convergence\n        run: node tools/cw4-contract-gate.mjs\n\n${anchor}`);
  }
  write(workflowPath, workflow);
}

let preflight = read('tools/production-freeze/preflight.mjs');
if (!preflight.includes("['cw4-domain-application-contracts'")) {
  preflight = preflight.replace("  ['cw3-bounded-context-dependency', 'node', ['tools/cw3-boundary-gate.mjs']],", "  ['cw3-bounded-context-dependency', 'node', ['tools/cw3-boundary-gate.mjs']],\n  ['cw4-domain-application-contracts', 'node', ['tools/cw4-contract-gate.mjs']],");
  preflight = preflight.replace("  ['cw3-bounded-context-dependency-post-validation', 'node', ['tools/cw3-boundary-gate.mjs']],", "  ['cw3-bounded-context-dependency-post-validation', 'node', ['tools/cw3-boundary-gate.mjs']],\n  ['cw4-domain-application-contracts-post-validation', 'node', ['tools/cw4-contract-gate.mjs']],");
}
write('tools/production-freeze/preflight.mjs', preflight);

// Focused Booking behavior proof updated for ExecutionContext and transaction propagation.
write('tests/unit/booking-application.behavior.test.ts', `import { describe, expect, it, vi } from 'vitest';
import type { ExecutionContext, TransactionContext } from '@carbroz/foundation-kernel';
import {
  CancelBookingUseCase,
  ConfirmBookingUseCase,
  CreateBookingUseCase,
  ExpirePendingBookingsUseCase,
  TransitionBookingStatusUseCase,
} from '@carbroz/domain-booking';

const future = (minutes: number) => new Date(Date.now() + minutes * 60_000);
const customerContext: ExecutionContext = { correlationId: 'customer-test', timestamp: new Date('2026-09-06T12:00:00Z'), actor: { id: 70, kind: 'CUSTOMER', roles: ['CUSTOMER'], customerId: 7 } };
const foreignContext: ExecutionContext = { ...customerContext, actor: { ...customerContext.actor, id: 80, customerId: 8 } };
const partnerContext: ExecutionContext = { correlationId: 'partner-test', timestamp: new Date('2026-09-06T12:00:00Z'), actor: { id: 220, kind: 'PARTNER', roles: ['PARTNER'], partnerId: 22 } };
const adminContext: ExecutionContext = { correlationId: 'admin-test', timestamp: new Date('2026-09-06T12:00:00Z'), actor: { id: 1, kind: 'ADMIN', roles: ['ADMIN'] } };
const systemContext: ExecutionContext = { correlationId: 'system-test', timestamp: new Date('2026-09-06T12:00:00Z'), actor: { id: 1, kind: 'SYSTEM', roles: ['SYSTEM'] } };
const transaction: TransactionContext = { resource: {} };

function input(overrides: Record<string, unknown> = {}) {
  return { customerId: 7, vehicleId: 2, addressId: 3, serviceId: 4, addonIds: [11, 12, 999], slotStartTime: future(60), slotEndTime: future(120), ...overrides } as any;
}
function vehicle(overrides: Record<string, unknown> = {}) { return { id: 2, customerId: 7, make: 'Tata', model: 'Nexon', variant: 'XZ', year: 2025, registrationNumber: 'MH01AB1234', fuelType: 'PETROL', isBookable: vi.fn().mockReturnValue(true), ...overrides }; }
function address() { return { id: 3, addressLine1: 'A-1', addressLine2: 'Floor 2', city: 'Pune', state: 'MH', postalCode: '411001', country: 'IN', latitude: 18.52, longitude: 73.85 }; }
function service(overrides: Record<string, unknown> = {}) { return { id: 4, name: 'Deep Wash', basePrice: 1_000, estimatedDurationMinutes: 90, isActive: true, ...overrides }; }
function bookingRepo(overrides: Record<string, unknown> = {}) { return { findConflictingSlotBooking: vi.fn().mockResolvedValue(null), create: vi.fn(async (value) => value), findByPublicId: vi.fn().mockResolvedValue(null), update: vi.fn(async (value) => value), findExpiredPendingBookings: vi.fn().mockResolvedValue([]), ...overrides }; }
function txProvider() { return { runInTransaction: vi.fn(async (work) => work(transaction)) }; }
function customerRepo() { return { findByUserId: vi.fn().mockResolvedValue({ id: 7 }) }; }
function createDeps(overrides: Record<string, unknown> = {}) {
  return { bookingRepository: bookingRepo(), vehicleRepository: { findById: vi.fn().mockResolvedValue(vehicle()) }, addressRepository: { findById: vi.fn().mockResolvedValue(address()) }, catalogRepository: { findServiceById: vi.fn().mockResolvedValue(service()), findAddonsByServiceId: vi.fn().mockResolvedValue([{ id: 11, name: 'Interior', price: 200, isActive: true }, { id: 12, name: 'Inactive', price: 300, isActive: false }]) }, pricingRepository: { findDefaultTierByServiceId: vi.fn().mockResolvedValue({ flatPrice: 1_200 }), findVehicleMultiplier: vi.fn().mockResolvedValue({ multiplier: 1.5 }) }, customerRepository: customerRepo(), transactionProvider: txProvider(), ...overrides } as any;
}
function createUseCase(d: any) { return new CreateBookingUseCase(d.bookingRepository, d.vehicleRepository, d.addressRepository, d.catalogRepository, d.pricingRepository, d.customerRepository, d.transactionProvider); }

describe('Booking application CW4 behavior', () => {
  it('derives customer authority from ExecutionContext and rejects DTO mismatch', async () => {
    const deps = createDeps();
    await expect(createUseCase(deps).execute(input({ customerId: 8 }), customerContext)).rejects.toThrow('does not match authenticated customer');
    await expect(createUseCase(deps).execute(input(), { ...customerContext, actor: { id: 1, kind: 'ADMIN', roles: ['ADMIN'] } })).rejects.toThrow('Customer authority is required');
  });

  it('rejects invalid slot, vehicle, address and service inputs with typed failures', async () => {
    const deps = createDeps();
    await expect(createUseCase(deps).execute(input({ slotStartTime: new Date('2000-01-01'), slotEndTime: future(60) }), customerContext)).rejects.toThrow('Slot start time must be in the future');
    const badVehicle = createDeps({ vehicleRepository: { findById: vi.fn().mockResolvedValue(vehicle({ customerId: 8 })) } });
    await expect(createUseCase(badVehicle).execute(input(), customerContext)).rejects.toThrow('Invalid or non-bookable vehicle');
    const noAddress = createDeps({ addressRepository: { findById: vi.fn().mockResolvedValue(null) } });
    await expect(createUseCase(noAddress).execute(input(), customerContext)).rejects.toThrow('Address not found');
    const noService = createDeps({ catalogRepository: { findServiceById: vi.fn().mockResolvedValue(null), findAddonsByServiceId: vi.fn() } });
    await expect(createUseCase(noService).execute(input(), customerContext)).rejects.toThrow('Service not found or inactive');
  });

  it('checks slot conflict and create through the exact same transaction context', async () => {
    const deps = createDeps();
    const result: any = await createUseCase(deps).execute(input(), customerContext);
    expect(deps.transactionProvider.runInTransaction).toHaveBeenCalledOnce();
    expect(deps.bookingRepository.findConflictingSlotBooking).toHaveBeenCalledWith(4, expect.any(Date), expect.any(Date), transaction);
    expect(deps.bookingRepository.create).toHaveBeenCalledWith(result, transaction);
    expect(result.totalPricePaise).toBe(2_360);
  });

  it('rejects a slot conflict inside the transaction before create', async () => {
    const deps = createDeps({ bookingRepository: bookingRepo({ findConflictingSlotBooking: vi.fn().mockResolvedValue({ id: 99 }) }) });
    await expect(createUseCase(deps).execute(input(), customerContext)).rejects.toThrow('Selected service slot is no longer available');
    expect(deps.bookingRepository.create).not.toHaveBeenCalled();
  });

  it('confirms only the authenticated owning customer', async () => {
    const owned = { customerId: 7, confirm: vi.fn() };
    const repo = bookingRepo({ findByPublicId: vi.fn().mockResolvedValue(owned) });
    const uc = new ConfirmBookingUseCase(repo as any, customerRepo() as any);
    await expect(uc.execute('owned', customerContext)).resolves.toBe(owned);
    expect(owned.confirm).toHaveBeenCalledWith(70);
    await expect(uc.execute('owned', foreignContext)).rejects.toThrow('Booking not found or unauthorized');
  });

  it('requires assigned partner/admin authority for service state transitions', async () => {
    const b = { partnerId: 22, startService: vi.fn(), completeService: vi.fn(), id: 10 };
    const repo = bookingRepo({ findByPublicId: vi.fn().mockResolvedValue(b) });
    await new TransitionBookingStatusUseCase(repo as any).execute({ bookingPublicId: 'x', targetStatus: 'IN_PROGRESS' }, partnerContext);
    expect(b.startService).toHaveBeenCalledWith(220);
    await expect(new TransitionBookingStatusUseCase(repo as any).execute({ bookingPublicId: 'x', targetStatus: 'COMPLETED' }, { ...partnerContext, actor: { ...partnerContext.actor, partnerId: 23 } })).rejects.toThrow('Assigned partner authority is required');
    await expect(new TransitionBookingStatusUseCase(repo as any).execute({ bookingPublicId: 'x', targetStatus: 'CANCELLED' as any }, adminContext)).rejects.toThrow('Unsupported direct transition');
  });

  it('creates payout eligibility only after completion when configured', async () => {
    const b = { partnerId: 22, completeService: vi.fn(), id: 10 };
    const repo = bookingRepo({ findByPublicId: vi.fn().mockResolvedValue(b) });
    const payout = { execute: vi.fn().mockResolvedValue({}) };
    await new TransitionBookingStatusUseCase(repo as any, payout).execute({ bookingPublicId: 'x', targetStatus: 'COMPLETED' }, partnerContext);
    expect(payout.execute).toHaveBeenCalledWith(10);
  });

  it('allows cancellation only to owning customer or admin', async () => {
    const b = { customerId: 7, cancel: vi.fn() };
    const repo = bookingRepo({ findByPublicId: vi.fn().mockResolvedValue(b) });
    const uc = new CancelBookingUseCase(repo as any, customerRepo() as any);
    await uc.execute({ bookingPublicId: 'x', reason: 'changed plan' }, customerContext);
    expect(b.cancel).toHaveBeenCalledWith(70, 'changed plan');
    await uc.execute({ bookingPublicId: 'x', reason: 'fraud' }, adminContext);
    expect(b.cancel).toHaveBeenCalledWith(1, 'fraud');
    await expect(uc.execute({ bookingPublicId: 'x', reason: 'x' }, foreignContext)).rejects.toThrow('Unauthorized to cancel this booking');
  });

  it('expires the full batch inside one transaction and rejects non-system authority', async () => {
    const first = { expire: vi.fn() };
    const second = { expire: vi.fn() };
    const repo = bookingRepo({ findExpiredPendingBookings: vi.fn().mockResolvedValue([first, second]) });
    const tx = txProvider();
    const uc = new ExpirePendingBookingsUseCase(repo as any, tx as any);
    await expect(uc.execute(systemContext)).resolves.toBe(2);
    expect(repo.findExpiredPendingBookings).toHaveBeenCalledWith(expect.any(Date), transaction);
    expect(repo.update).toHaveBeenCalledWith(first, transaction);
    expect(repo.update).toHaveBeenCalledWith(second, transaction);
    await expect(uc.execute(customerContext)).rejects.toThrow('System authority is required');
  });
});
`);

write('tests/integration/booking-transaction-rollback.integration.test.ts', `import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Booking, type BookingSnapshots } from '@carbroz/domain-booking';
import { PrismaProvider, PrismaTransactionProvider } from '@carbroz/platform-database';
import { PrismaBookingRepository } from '../../domains/booking/infrastructure/repositories/PrismaBookingRepository.js';

const provider = new PrismaProvider();
const prisma = provider.getClient();
const suffix = randomUUID().replaceAll('-', '').slice(0, 12);
let userId = 0;
let categoryId = 0;

beforeAll(async () => {
  await provider.connect();
});

afterAll(async () => {
  if (categoryId) await prisma.serviceCategory.delete({ where: { id: categoryId } }).catch(() => undefined);
  if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
  await provider.disconnect();
});

describe('CW4 real PostgreSQL transaction propagation', () => {
  it('rolls back a Booking repository write performed through the exact transaction-bound Prisma client', async () => {
    const user = await prisma.user.create({ data: { phoneNumber: `+9198${suffix.slice(0, 8)}` } });
    userId = user.id;
    const customer = await prisma.customerProfile.create({ data: { userId: user.id, firstName: 'CW4' } });
    const address = await prisma.address.create({ data: { userId: user.id, addressLine1: 'CW4 Road', city: 'Pune', state: 'MH', postalCode: '411001', country: 'IN' } });
    const category = await prisma.serviceCategory.create({ data: { name: `CW4-${suffix}`, slug: `cw4-${suffix}` } });
    categoryId = category.id;
    const service = await prisma.service.create({ data: { categoryId: category.id, name: `Wash-${suffix}`, slug: `wash-${suffix}`, basePrice: 1000, estimatedDurationMinutes: 60 } });
    const vehicle = await prisma.vehicle.create({ data: { customerId: customer.id, make: 'Tata', model: 'Nexon', year: 2026, registrationNumber: `CW4${suffix.slice(0, 7).toUpperCase()}`, fuelType: 'PETROL' } });

    const snapshots: BookingSnapshots = {
      service: { serviceId: service.id, name: service.name, basePricePaise: 1000, estimatedDurationMinutes: 60 },
      addons: [],
      pricing: { basePricePaise: 1000, addonsTotalPaise: 0, vehicleMultiplier: 1, subtotalPaise: 1000, taxesPaise: 180, totalPricePaise: 1180 },
      address: { addressLine1: address.addressLine1, city: address.city, state: address.state, postalCode: address.postalCode, country: address.country },
      vehicle: { make: vehicle.make, model: vehicle.model, year: vehicle.year, registrationNumber: vehicle.registrationNumber, fuelType: vehicle.fuelType },
    };
    const booking = new Booking({ customerId: customer.id, vehicleId: vehicle.id, addressId: address.id, serviceId: service.id, slotStartTime: new Date('2026-10-01T10:00:00Z'), slotEndTime: new Date('2026-10-01T11:00:00Z'), totalPricePaise: 1180, snapshots });
    const repository = new PrismaBookingRepository(prisma);
    const transactions = new PrismaTransactionProvider(provider);
    let rolledBackPublicId: string | undefined;

    await expect(transactions.runInTransaction(async (transaction) => {
      const created = await repository.create(booking, transaction);
      rolledBackPublicId = created.publicId;
      expect(await repository.findByPublicId(created.publicId!, transaction)).not.toBeNull();
      throw new Error('intentional-cw4-rollback');
    })).rejects.toThrow('intentional-cw4-rollback');

    expect(rolledBackPublicId).toBeDefined();
    expect(await prisma.booking.findUnique({ where: { publicId: rolledBackPublicId! } })).toBeNull();
  });
});
`);

console.log('[cw4-one-pass] candidate tree generated');
