import { describe, expect, it, vi } from 'vitest';
import {
  ExtractCustomerDataUseCase,
  GetCustomerProfileUseCase,
  ManageAddressUseCase,
  UpdateCustomerProfileUseCase,
} from '@carbroz/domain-customer';

function context(actor: Record<string, unknown> | undefined) {
  return {
    correlationId: 'test-correlation',
    actor,
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
  } as any;
}

const selfByCustomerId = context({ id: 999, kind: 'CUSTOMER', roles: [], customerId: 7 });
const selfById = context({ id: 7, kind: 'CUSTOMER', roles: [] });
const adminKind = context({ id: 1, kind: 'ADMIN', roles: [] });
const adminRole = context({ id: 1, kind: 'CUSTOMER', roles: ['ADMIN'] });
const foreign = context({ id: 99, kind: 'CUSTOMER', roles: [], customerId: 99 });

function profileRepo(existing: unknown = null) {
  return {
    findByUserId: vi.fn().mockResolvedValue(existing),
    save: vi.fn(async (value) => value),
  };
}

function address(overrides: Record<string, unknown> = {}) {
  return {
    id: 5,
    userId: 7,
    label: 'Home',
    addressLine1: 'Old line 1',
    addressLine2: null,
    city: 'Pune',
    state: 'MH',
    postalCode: '411001',
    country: 'IN',
    latitude: 18.52,
    longitude: 73.85,
    isDefault: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function addressRepo(existing: unknown = address()) {
  return {
    findByUserId: vi.fn().mockResolvedValue([address()]),
    findDefaultByUserId: vi.fn().mockResolvedValue(address({ isDefault: true })),
    findById: vi.fn().mockResolvedValue(existing),
    save: vi.fn(async (value) => value),
    delete: vi.fn().mockResolvedValue(true),
  };
}

describe('Customer application behavior', () => {
  describe('customer access policy through profile use cases', () => {
    it('rejects a missing actor and a foreign customer', async () => {
      for (const ctx of [context(undefined), foreign]) {
        const uc = new GetCustomerProfileUseCase(profileRepo() as any);
        await expect(uc.execute({ context: ctx, data: { userId: 7 } })).rejects.toThrow('FORBIDDEN');
      }
    });

    it('accepts ADMIN kind, ADMIN role, customerId ownership and actor-id ownership', async () => {
      for (const ctx of [adminKind, adminRole, selfByCustomerId, selfById]) {
        const existing = { userId: 7, firstName: 'Lalit' };
        const repo = profileRepo(existing);
        const result = await new GetCustomerProfileUseCase(repo as any).execute({ context: ctx, data: { userId: 7 } });
        expect(result).toBe(existing);
        expect(repo.save).not.toHaveBeenCalled();
      }
    });

    it('initializes and persists a default profile when none exists', async () => {
      const repo = profileRepo(null);
      const result = await new GetCustomerProfileUseCase(repo as any).execute({ context: selfById, data: { userId: 7 } });
      expect(repo.save).toHaveBeenCalledOnce();
      expect(result).toMatchObject({ userId: 7, firstName: null, lastName: null, dateOfBirth: null, gender: null, marketingOptIn: false });
    });
  });

  describe('UpdateCustomerProfileUseCase', () => {
    it('rejects unauthorized updates', async () => {
      await expect(new UpdateCustomerProfileUseCase(profileRepo() as any).execute({ context: foreign, data: { userId: 7, firstName: 'No' } })).rejects.toThrow('FORBIDDEN');
    });

    it('creates a missing profile and leaves omitted fields untouched', async () => {
      const repo = profileRepo(null);
      const before = Date.now();
      const result = await new UpdateCustomerProfileUseCase(repo as any).execute({ context: selfById, data: { userId: 7 } });
      expect(result.userId).toBe(7);
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(repo.save).toHaveBeenCalledWith(result);
    });

    it('updates every explicitly supplied field including nullable values and false booleans', async () => {
      const existing: any = {
        userId: 7,
        firstName: 'Old',
        lastName: 'Name',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'M',
        marketingOptIn: true,
        updatedAt: new Date('2020-01-01'),
      };
      const repo = profileRepo(existing);
      const dob = new Date('2000-02-03');
      const result = await new UpdateCustomerProfileUseCase(repo as any).execute({
        context: selfByCustomerId,
        data: { userId: 7, firstName: null, lastName: 'Naiya', dateOfBirth: dob, gender: null, marketingOptIn: false },
      });
      expect(result).toMatchObject({ firstName: null, lastName: 'Naiya', dateOfBirth: dob, gender: null, marketingOptIn: false });
      expect(result.updatedAt.getTime()).toBeGreaterThan(new Date('2020-01-01').getTime());
    });
  });

  describe('ManageAddressUseCase', () => {
    it('rejects unauthorized address access', async () => {
      await expect(new ManageAddressUseCase(addressRepo() as any).execute({ context: foreign, data: { userId: 7, action: 'GET_ALL' } })).rejects.toThrow('FORBIDDEN');
    });

    it('returns all addresses and the default address', async () => {
      const repo = addressRepo();
      const uc = new ManageAddressUseCase(repo as any);
      await expect(uc.execute({ context: selfById, data: { userId: 7, action: 'GET_ALL' } })).resolves.toHaveLength(1);
      await expect(uc.execute({ context: selfById, data: { userId: 7, action: 'GET_DEFAULT' } })).resolves.toMatchObject({ isDefault: true });
      expect(repo.findByUserId).toHaveBeenCalledWith(7);
      expect(repo.findDefaultByUserId).toHaveBeenCalledWith(7);
    });

    it('requires an ADD payload and forces ownership to the requested user', async () => {
      const repo = addressRepo();
      const uc = new ManageAddressUseCase(repo as any);
      await expect(uc.execute({ context: selfById, data: { userId: 7, action: 'ADD' } })).rejects.toThrow('Payload required');
      const result = await uc.execute({
        context: selfById,
        data: { userId: 7, action: 'ADD', payload: { userId: 999, label: 'Office', addressLine1: 'Line', city: 'Pune', state: 'MH', postalCode: '411001', country: 'IN' } as any },
      });
      expect(result).toMatchObject({ userId: 7, label: 'Office' });
      expect(repo.save).toHaveBeenCalledWith(result);
    });

    it('validates UPDATE identity and ownership', async () => {
      const ucNoId = new ManageAddressUseCase(addressRepo() as any);
      await expect(ucNoId.execute({ context: selfById, data: { userId: 7, action: 'UPDATE', payload: {} } })).rejects.toThrow('addressId required for update');

      for (const existing of [null, address({ userId: 8 })]) {
        const uc = new ManageAddressUseCase(addressRepo(existing) as any);
        await expect(uc.execute({ context: selfById, data: { userId: 7, action: 'UPDATE', addressId: 5, payload: {} } })).rejects.toThrow('Address not found');
      }
    });

    it('updates every explicitly provided address field', async () => {
      const existing: any = address();
      const repo = addressRepo(existing);
      const uc = new ManageAddressUseCase(repo as any);
      const result: any = await uc.execute({
        context: selfById,
        data: {
          userId: 7,
          action: 'UPDATE',
          addressId: 5,
          payload: {
            label: null,
            addressLine1: 'New line 1',
            addressLine2: 'New line 2',
            city: 'Mumbai',
            state: 'MH2',
            postalCode: '400001',
            country: 'India',
            latitude: 19.0,
            longitude: 72.8,
            isDefault: true,
          } as any,
        },
      });
      expect(result).toMatchObject({
        label: null,
        addressLine1: 'New line 1',
        addressLine2: 'New line 2',
        city: 'Mumbai',
        state: 'MH2',
        postalCode: '400001',
        country: 'India',
        latitude: 19.0,
        longitude: 72.8,
        isDefault: true,
      });
      expect(repo.save).toHaveBeenCalledWith(existing);
    });

    it('preserves every address field when UPDATE payload omits them', async () => {
      const existing: any = address();
      const snapshot = { ...existing };
      const repo = addressRepo(existing);
      await new ManageAddressUseCase(repo as any).execute({ context: selfById, data: { userId: 7, action: 'UPDATE', addressId: 5 } });
      for (const key of ['label','addressLine1','addressLine2','city','state','postalCode','country','latitude','longitude','isDefault']) {
        expect(existing[key]).toEqual((snapshot as any)[key]);
      }
    });

    it('validates DELETE identity/ownership and deletes an owned address', async () => {
      await expect(new ManageAddressUseCase(addressRepo() as any).execute({ context: selfById, data: { userId: 7, action: 'DELETE' } })).rejects.toThrow('addressId required for deletion');
      for (const existing of [null, address({ userId: 8 })]) {
        await expect(new ManageAddressUseCase(addressRepo(existing) as any).execute({ context: selfById, data: { userId: 7, action: 'DELETE', addressId: 5 } })).rejects.toThrow('Address not found');
      }
      const repo = addressRepo();
      await expect(new ManageAddressUseCase(repo as any).execute({ context: selfById, data: { userId: 7, action: 'DELETE', addressId: 5 } })).resolves.toBe(true);
      expect(repo.delete).toHaveBeenCalledWith(5);
    });

    it('rejects unknown actions defensively', async () => {
      await expect(new ManageAddressUseCase(addressRepo() as any).execute({ context: selfById, data: { userId: 7, action: 'BOGUS' as any } })).rejects.toThrow('Unknown action BOGUS');
    });
  });

  describe('ExtractCustomerDataUseCase', () => {
    it('rejects unauthorized extraction', async () => {
      await expect(new ExtractCustomerDataUseCase(profileRepo() as any, addressRepo() as any).execute({ context: foreign, data: { userId: 7 } })).rejects.toThrow('FORBIDDEN');
    });

    it('exports a present profile and maps all owned address fields', async () => {
      const profile = {
        firstName: 'Lalit', lastName: 'Naiya', dateOfBirth: new Date('1990-01-01'), gender: 'M', marketingOptIn: true, createdAt: new Date('2020-01-01'),
      };
      const addresses = [address(), address({ id: 6, label: 'Office', addressLine2: 'Floor 2', isDefault: true })];
      const pRepo = profileRepo(profile);
      const aRepo = addressRepo();
      aRepo.findByUserId.mockResolvedValue(addresses as any);
      const result = await new ExtractCustomerDataUseCase(pRepo as any, aRepo as any).execute({ context: adminRole, data: { userId: 7 } });
      expect(result.userId).toBe(7);
      expect(new Date(result.extractedAt).toString()).not.toBe('Invalid Date');
      expect(result.profile).toMatchObject({ firstName: 'Lalit', lastName: 'Naiya', marketingOptIn: true });
      expect(result.addresses).toHaveLength(2);
      expect(result.addresses[1]).toMatchObject({ label: 'Office', addressLine2: 'Floor 2', isDefault: true });
    });

    it('exports null profile and an empty address list when Customer owns no stored data', async () => {
      const pRepo = profileRepo(null);
      const aRepo = addressRepo();
      aRepo.findByUserId.mockResolvedValue([]);
      const result = await new ExtractCustomerDataUseCase(pRepo as any, aRepo as any).execute({ context: selfById, data: { userId: 7 } });
      expect(result.profile).toBeNull();
      expect(result.addresses).toEqual([]);
    });
  });
});
