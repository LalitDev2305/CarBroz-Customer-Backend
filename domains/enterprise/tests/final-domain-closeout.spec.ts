import { describe, expect, it, vi } from 'vitest';
import { Money } from '@carbroz/foundation-kernel';
import { CorporateAccount } from '../domain/CorporateAccount.js';
import { AdjustCreditLimitUseCase } from '../use-cases/AdjustCreditLimitUseCase.js';
import { RemoveCorporateMemberUseCase } from '../use-cases/RemoveCorporateMemberUseCase.js';
import { RemoveFleetVehicleUseCase } from '../use-cases/RemoveFleetVehicleUseCase.js';

const address = { addressLine1: 'A', city: 'Pune', state: 'MH', postalCode: '411001', country: 'IN' };
const accountProps = (overrides: Record<string, unknown> = {}) => ({
  id: 1, publicId: 'corp-1', companyName: 'CarBroz Corp', legalName: 'CarBroz Pvt Ltd', gstin: 'gst123', pan: 'PAN1', billingAddress: address,
  ...overrides,
});

describe('Enterprise final policy closeout', () => {
  it('covers CorporateAccount validation, defaults, credit and lifecycle guards', () => {
    expect(() => new CorporateAccount(accountProps({ companyName: ' ' }) as any)).toThrow('Company name');
    expect(() => new CorporateAccount(accountProps({ gstin: '' }) as any)).toThrow('GSTIN');
    const account = new CorporateAccount(accountProps() as any);
    expect(account).toMatchObject({ gstin: 'GST123', creditLimitPaise: 0n, utilisedCreditPaise: 0n, status: 'PENDING_APPROVAL', paymentTermsDays: 30 });
    expect(account.availableCredit.amountMinor).toBe(0);
    expect(account.canCoverAmount(Money.fromMinor(1))).toBe(false);
    account.approve(Money.fromMinor(1000));
    expect(account.status).toBe('ACTIVE');
    expect(account.canCoverAmount(Money.fromMinor(1000))).toBe(true);
    expect(account.canCoverAmount(Money.fromMinor(1001))).toBe(false);
    expect(() => account.approve(Money.fromMinor(1))).toThrow('Cannot approve');
    account.suspend('risk');
    expect(account.status).toBe('SUSPENDED');
    account.adjustCreditLimit(Money.fromMinor(500));
    expect(account.creditLimitPaise).toBe(500n);

    const used = new CorporateAccount(accountProps({ status: 'ACTIVE', creditLimitPaise: 100, utilisedCreditPaise: 150 }) as any);
    expect(used.availableCredit.amountMinor).toBe(0);
    const closed = new CorporateAccount(accountProps({ status: 'CLOSED' }) as any);
    expect(() => closed.suspend('x')).toThrow('closed');
    expect(() => closed.adjustCreditLimit(Money.fromMinor(1))).toThrow('closed');
  });

  it('covers AdjustCreditLimit missing account, explicit reason and default audit reason', async () => {
    const repo = { findByPublicId: vi.fn(), update: vi.fn() } as any;
    const accounting = { recordCreditAdjustment: vi.fn() } as any;
    const audit = { log: vi.fn() } as any;
    const useCase = new AdjustCreditLimitUseCase(repo, accounting, audit);
    repo.findByPublicId.mockResolvedValueOnce(null);
    await expect(useCase.execute({ accountPublicId: 'missing', newCreditLimitPaise: 1000 } as any, 9)).rejects.toThrow('not found');

    const account = new CorporateAccount(accountProps({ creditLimitPaise: 500, utilisedCreditPaise: 100, status: 'ACTIVE' }) as any);
    repo.findByPublicId.mockResolvedValue(account);
    repo.update.mockImplementation(async (value: unknown) => value);
    await useCase.execute({ accountPublicId: 'corp-1', newCreditLimitPaise: 1500, reason: 'Approved increase' } as any, 9);
    expect(accounting.recordCreditAdjustment).toHaveBeenLastCalledWith(expect.objectContaining({ amountPaise: 1000n, balanceAfterPaise: 1400n, referenceNotes: 'Approved increase' }));
    await useCase.execute({ accountPublicId: 'corp-1', newCreditLimitPaise: 1600 } as any, 7);
    expect(accounting.recordCreditAdjustment).toHaveBeenLastCalledWith(expect.objectContaining({ referenceNotes: 'Credit limit adjusted by Admin ID 7' }));
    expect(audit.log).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['member', RemoveCorporateMemberUseCase, 'memberPublicId', 'member-1'],
    ['vehicle', RemoveFleetVehicleUseCase, 'fleetVehiclePublicId', 'fleet-1'],
  ] as const)('covers %s removal account/resource ownership and success', async (_name, UseCase, resourceField, publicId) => {
    const accountRepo = { findByPublicId: vi.fn() } as any;
    const resource = { publicId, corporateAccountId: 1, deactivate: vi.fn() } as any;
    const resourceRepo = { findByPublicId: vi.fn(), update: vi.fn() } as any;
    const audit = { log: vi.fn() } as any;
    const useCase = new UseCase(accountRepo, resourceRepo, audit);
    const dto = { accountPublicId: 'corp-1', [resourceField]: publicId } as any;

    accountRepo.findByPublicId.mockResolvedValueOnce(null);
    await expect(useCase.execute(dto, 5)).rejects.toThrow('Corporate account not found');
    accountRepo.findByPublicId.mockResolvedValue({ id: 1, publicId: 'corp-1' });
    resourceRepo.findByPublicId.mockResolvedValueOnce(null);
    await expect(useCase.execute(dto, 5)).rejects.toThrow('not found');
    resourceRepo.findByPublicId.mockResolvedValueOnce({ ...resource, corporateAccountId: 2 });
    await expect(useCase.execute(dto, 5)).rejects.toThrow('not found');
    resourceRepo.findByPublicId.mockResolvedValueOnce(resource);
    await useCase.execute(dto, 5);
    expect(resource.deactivate).toHaveBeenCalled();
    expect(resourceRepo.update).toHaveBeenCalledWith(resource);
    expect(audit.log).toHaveBeenCalled();
  });
});
