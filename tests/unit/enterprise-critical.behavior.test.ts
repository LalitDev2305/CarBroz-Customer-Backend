import { describe, expect, it, vi } from 'vitest';
import {
  AddCorporateMemberUseCase,
  EnrollFleetVehicleUseCase,
  ValidateCorporateBookingUseCase,
} from '@carbroz/domain-enterprise';

const account = (overrides: Record<string, unknown> = {}) => ({
  id: 10,
  publicId: 'corp-1',
  status: 'ACTIVE',
  creditLimitPaise: 100_000n,
  utilisedCreditPaise: 10_000n,
  canCoverAmount: vi.fn(() => true),
  ...overrides,
});

const audit = () => ({ log: vi.fn(async () => undefined) });

describe('Enterprise critical application decisions', () => {
  it('adds an active corporate member and records the audit event', async () => {
    const corporateAccountRepo = { findByPublicId: vi.fn(async () => account()) };
    const corporateMemberRepo = {
      findByAccountAndUser: vi.fn(async () => null),
      create: vi.fn(async (member: any) => ({ ...member, publicId: 'member-1' })),
    };
    const userRepository = { findByEmail: vi.fn(async () => ({ id: 21, email: 'member@example.test' })) };
    const auditLogService = audit();
    const useCase = new AddCorporateMemberUseCase(
      corporateAccountRepo as any,
      corporateMemberRepo as any,
      userRepository as any,
      auditLogService as any,
    );

    const result = await useCase.execute({
      accountPublicId: 'corp-1',
      userEmail: 'member@example.test',
      role: 'MEMBER',
      monthlyCapPaise: 25_000,
    } as any, 99);

    expect(result).toMatchObject({ publicId: 'member-1', corporateAccountId: 10, userId: 21, role: 'MEMBER', status: 'ACTIVE' });
    expect(result.monthlyCapPaise).toBe(25_000n);
    expect(auditLogService.log).toHaveBeenCalledWith(expect.objectContaining({
      actorId: 99,
      action: 'CORPORATE_MEMBER_ADD',
      resourcePublicId: 'member-1',
    }));
  });

  it('supports a member without a monthly cap', async () => {
    const useCase = new AddCorporateMemberUseCase(
      { findByPublicId: vi.fn(async () => account()) } as any,
      { findByAccountAndUser: vi.fn(async () => null), create: vi.fn(async (member: any) => member) } as any,
      { findByEmail: vi.fn(async () => ({ id: 21 })) } as any,
      audit() as any,
    );
    const result = await useCase.execute({ accountPublicId: 'corp-1', userEmail: 'member@example.test', role: 'MEMBER' } as any, 99);
    expect(result.monthlyCapPaise).toBeNull();
  });

  it('rejects member addition when account, user, lookup capability, or duplicate membership is invalid', async () => {
    const baseMemberRepo = { findByAccountAndUser: vi.fn(async () => null), create: vi.fn() };
    await expect(new AddCorporateMemberUseCase(
      { findByPublicId: vi.fn(async () => null) } as any,
      baseMemberRepo as any,
      { findByEmail: vi.fn() } as any,
      audit() as any,
    ).execute({ accountPublicId: 'missing', userEmail: 'x@example.test', role: 'MEMBER' } as any, 1)).rejects.toThrow('Corporate account not found');

    await expect(new AddCorporateMemberUseCase(
      { findByPublicId: vi.fn(async () => account()) } as any,
      baseMemberRepo as any,
      {} as any,
      audit() as any,
    ).execute({ accountPublicId: 'corp-1', userEmail: 'x@example.test', role: 'MEMBER' } as any, 1)).rejects.toThrow('does not exist');

    await expect(new AddCorporateMemberUseCase(
      { findByPublicId: vi.fn(async () => account()) } as any,
      baseMemberRepo as any,
      { findByEmail: vi.fn(async () => null) } as any,
      audit() as any,
    ).execute({ accountPublicId: 'corp-1', userEmail: 'x@example.test', role: 'MEMBER' } as any, 1)).rejects.toThrow('does not exist');

    await expect(new AddCorporateMemberUseCase(
      { findByPublicId: vi.fn(async () => account()) } as any,
      { findByAccountAndUser: vi.fn(async () => ({ id: 1 })), create: vi.fn() } as any,
      { findByEmail: vi.fn(async () => ({ id: 21 })) } as any,
      audit() as any,
    ).execute({ accountPublicId: 'corp-1', userEmail: 'x@example.test', role: 'MEMBER' } as any, 1)).rejects.toThrow('already a member');
  });

  it('enrolls a garage vehicle into the corporate fleet with optional cap and audit evidence', async () => {
    const fleetVehicleRepo = {
      findByAccountAndVehicle: vi.fn(async () => null),
      create: vi.fn(async (entity: any) => ({ ...entity, publicId: 'fleet-1' })),
    };
    const auditLogService = audit();
    const useCase = new EnrollFleetVehicleUseCase(
      { findByPublicId: vi.fn(async () => account()) } as any,
      fleetVehicleRepo as any,
      { findByRegistrationNumber: vi.fn(async () => ({ id: 31 })) } as any,
      auditLogService as any,
    );

    const result = await useCase.execute({
      accountPublicId: 'corp-1', registrationNumber: 'MH12AB1234', department: 'Sales', costCenter: 'CC-01', monthlyCapPaise: 30_000,
    } as any, 99);
    expect(result).toMatchObject({ corporateAccountId: 10, vehicleId: 31, department: 'Sales', costCenter: 'CC-01', status: 'ACTIVE' });
    expect(result.monthlyCapPaise).toBe(30_000n);
    expect(auditLogService.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'FLEET_VEHICLE_ENROLL', resourcePublicId: 'fleet-1' }));

    const noCap = await new EnrollFleetVehicleUseCase(
      { findByPublicId: vi.fn(async () => account()) } as any,
      { findByAccountAndVehicle: vi.fn(async () => null), create: vi.fn(async (entity: any) => entity) } as any,
      { findByRegistrationNumber: vi.fn(async () => ({ id: 31 })) } as any,
      audit() as any,
    ).execute({ accountPublicId: 'corp-1', registrationNumber: 'MH12AB1234' } as any, 99);
    expect(noCap.monthlyCapPaise).toBeNull();
  });

  it('rejects fleet enrollment for missing account/vehicle lookup/vehicle and duplicate enrollment', async () => {
    const noEnrollment = { findByAccountAndVehicle: vi.fn(async () => null), create: vi.fn() };
    await expect(new EnrollFleetVehicleUseCase(
      { findByPublicId: vi.fn(async () => null) } as any, noEnrollment as any, {} as any, audit() as any,
    ).execute({ accountPublicId: 'missing', registrationNumber: 'MH12AB1234' } as any, 1)).rejects.toThrow('Corporate account not found');

    for (const vehicleRepository of [{}, { findByRegistrationNumber: vi.fn(async () => null) }]) {
      await expect(new EnrollFleetVehicleUseCase(
        { findByPublicId: vi.fn(async () => account()) } as any,
        noEnrollment as any,
        vehicleRepository as any,
        audit() as any,
      ).execute({ accountPublicId: 'corp-1', registrationNumber: 'MH12AB1234' } as any, 1)).rejects.toThrow('not found in garage');
    }

    await expect(new EnrollFleetVehicleUseCase(
      { findByPublicId: vi.fn(async () => account()) } as any,
      { findByAccountAndVehicle: vi.fn(async () => ({ id: 1 })) } as any,
      { findByRegistrationNumber: vi.fn(async () => ({ id: 31 })) } as any,
      audit() as any,
    ).execute({ accountPublicId: 'corp-1', registrationNumber: 'MH12AB1234' } as any, 1)).rejects.toThrow('already enrolled');
  });

  const validationCase = (overrides: Record<string, any> = {}) => new ValidateCorporateBookingUseCase(
    (overrides.corporateAccountRepo ?? { findById: vi.fn(async () => account()) }) as any,
    (overrides.corporateMemberRepo ?? { findByUserId: vi.fn(async () => ({ corporateAccountId: 10, status: 'ACTIVE' })) }) as any,
    (overrides.fleetVehicleRepo ?? { findByAccountAndVehicle: vi.fn(async () => ({ id: 41, status: 'ACTIVE' })) }) as any,
    (overrides.creditLedgerRepo ?? { create: vi.fn(async (entry: any) => entry) }) as any,
    (overrides.userRepository ?? { findByPublicId: vi.fn(async () => ({ id: 21 })) }) as any,
    (overrides.vehicleRepository ?? { findByPublicId: vi.fn(async () => ({ id: 31 })) }) as any,
  );

  it('accepts an active member, account and fleet vehicle within credit limit', async () => {
    await expect(validationCase().execute({ userPublicId: 'u-1', vehiclePublicId: 'v-1', bookingAmountPaise: 20_000 } as any))
      .resolves.toEqual({ eligible: true, corporateAccountId: 10, corporateFleetVehicleId: 41 });
  });

  it('returns a precise ineligibility reason for each corporate booking guard', async () => {
    const dto = { userPublicId: 'u-1', vehiclePublicId: 'v-1', bookingAmountPaise: 20_000 } as any;
    await expect(validationCase({ userRepository: {} }).execute(dto)).resolves.toEqual({ eligible: false, reason: 'User not found' });
    await expect(validationCase({ userRepository: { findByPublicId: vi.fn(async () => null) } }).execute(dto)).resolves.toEqual({ eligible: false, reason: 'User not found' });
    await expect(validationCase({ corporateMemberRepo: { findByUserId: vi.fn(async () => null) } }).execute(dto)).resolves.toEqual({ eligible: false, reason: 'User is not an active corporate member' });
    await expect(validationCase({ corporateMemberRepo: { findByUserId: vi.fn(async () => ({ corporateAccountId: 10, status: 'SUSPENDED' })) } }).execute(dto)).resolves.toEqual({ eligible: false, reason: 'User is not an active corporate member' });
    await expect(validationCase({ corporateAccountRepo: { findById: vi.fn(async () => null) } }).execute(dto)).resolves.toEqual({ eligible: false, reason: 'Corporate account is not active' });
    await expect(validationCase({ corporateAccountRepo: { findById: vi.fn(async () => account({ status: 'SUSPENDED' })) } }).execute(dto)).resolves.toEqual({ eligible: false, reason: 'Corporate account is not active' });
    await expect(validationCase({ vehicleRepository: { findByPublicId: vi.fn(async () => null) } }).execute(dto)).resolves.toEqual({ eligible: false, reason: 'Vehicle not found' });
    await expect(validationCase({ fleetVehicleRepo: { findByAccountAndVehicle: vi.fn(async () => null) } }).execute(dto)).resolves.toEqual({ eligible: false, reason: 'Vehicle is not enrolled in active corporate fleet' });
    await expect(validationCase({ fleetVehicleRepo: { findByAccountAndVehicle: vi.fn(async () => ({ id: 41, status: 'SUSPENDED' })) } }).execute(dto)).resolves.toEqual({ eligible: false, reason: 'Vehicle is not enrolled in active corporate fleet' });
    await expect(validationCase({ corporateAccountRepo: { findById: vi.fn(async () => account({ canCoverAmount: vi.fn(() => false) })) } }).execute(dto)).resolves.toEqual({ eligible: false, reason: 'Corporate account credit limit exceeded' });
  });

  it('debits corporate credit and writes a booking ledger entry', async () => {
    const updated = account({ utilisedCreditPaise: 30_000n });
    const corporateAccountRepo = {
      findById: vi.fn(async () => account()),
      updateUtilisedCredit: vi.fn(async () => updated),
    };
    const creditLedgerRepo = { create: vi.fn(async (entry: any) => entry) };
    const useCase = validationCase({ corporateAccountRepo, creditLedgerRepo });
    await useCase.processBookingDebit(10, 501, 20_000);
    expect(corporateAccountRepo.updateUtilisedCredit).toHaveBeenCalledWith(10, 20_000n);
    expect(creditLedgerRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      corporateAccountId: 10,
      bookingId: 501,
      entryType: 'BOOKING_DEBIT',
      amountPaise: 20_000n,
      balanceAfterPaise: 70_000n,
    }));
  });

  it('rejects a debit for a missing corporate account', async () => {
    await expect(validationCase({ corporateAccountRepo: { findById: vi.fn(async () => null) } }).processBookingDebit(10, 501, 20_000))
      .rejects.toThrow('Corporate account not found');
  });
});
