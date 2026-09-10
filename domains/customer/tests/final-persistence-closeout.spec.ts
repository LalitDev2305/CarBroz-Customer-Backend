import { describe, expect, it, vi } from 'vitest';
import { Address } from '../address/domain/Address.js';
import { PrismaAddressRepository } from '../address/infrastructure/repositories/PrismaAddressRepository.js';
import { Vehicle } from '../garage/domain/Vehicle.js';
import { PrismaVehicleRepository } from '../garage/infrastructure/repositories/PrismaVehicleRepository.js';
import { SetDefaultVehicleUseCase } from '../garage/application/use-cases/SetDefaultVehicleUseCase.js';
import { CustomerProfile } from '../profile/domain/CustomerProfile.js';
import { PrismaCustomerProfileRepository } from '../profile/infrastructure/repositories/PrismaCustomerProfileRepository.js';

const now = new Date('2026-01-01T00:00:00.000Z');
const addressRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 1, publicId: 'addr-1', userId: 3, label: 'Home', addressLine1: 'A', addressLine2: null,
  city: 'Pune', state: 'MH', postalCode: '411001', country: 'IN', latitude: null, longitude: null,
  isDefault: false, createdAt: now, updatedAt: now, deletedAt: null, ...overrides,
});
const vehicleRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 2, publicId: 'veh-2', customerId: 3, make: 'Tata', model: 'Nexon', variant: null, year: 2025,
  registrationNumber: 'MH12AB1234', fuelType: 'PETROL', color: null, nickname: null, isDefault: false,
  status: 'ACTIVE', createdAt: now, updatedAt: now, deletedAt: null, ...overrides,
});
const profileRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 4, publicId: 'profile-4', userId: 3, firstName: 'Lalit', lastName: null, dateOfBirth: null,
  gender: null, marketingOptIn: false, createdAt: now, updatedAt: now, deletedAt: null, ...overrides,
});

describe('Customer final persistence closeout', () => {
  it('covers Address lookup/default/list/save transaction and delete branches', async () => {
    const addressModel = { findUnique: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), create: vi.fn() };
    const tx = { address: addressModel };
    const prisma = { address: addressModel, $transaction: vi.fn((cb: (x: any) => unknown) => cb(tx)) } as any;
    const repo = new PrismaAddressRepository(prisma, () => now);
    addressModel.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(addressRecord());
    await expect(repo.findById(1)).resolves.toBeNull();
    await expect(repo.findByPublicId('addr-1')).resolves.toMatchObject({ publicId: 'addr-1' });
    addressModel.findMany.mockResolvedValue([addressRecord()]);
    await expect(repo.findByUserId(3)).resolves.toHaveLength(1);
    await expect(repo.findAll()).resolves.toHaveLength(1);
    addressModel.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(addressRecord({ isDefault: true }));
    await expect(repo.findDefaultByUserId(3)).resolves.toBeNull();
    await expect(repo.findDefaultByUserId(3)).resolves.toMatchObject({ isDefault: true });

    const base = new Address(addressRecord({ id: undefined, publicId: undefined }) as any);
    addressModel.create.mockResolvedValue(addressRecord());
    await repo.save(base);
    expect(addressModel.updateMany).not.toHaveBeenCalled();
    const defaultAddress = new Address(addressRecord({ id: 1, isDefault: true }) as any);
    addressModel.update.mockResolvedValue(addressRecord({ isDefault: true }));
    await repo.save(defaultAddress);
    expect(addressModel.updateMany).toHaveBeenCalled();
    addressModel.update.mockResolvedValueOnce(addressRecord({ deletedAt: now }));
    await expect(repo.delete(1)).resolves.toBe(true);
    addressModel.update.mockRejectedValueOnce(new Error('missing'));
    await expect(repo.delete(1)).resolves.toBe(false);
  });

  it('covers Vehicle CRUD, normalization, list, default-unset and soft-delete branches', async () => {
    const model = { create: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(), updateMany: vi.fn() };
    const repo = new PrismaVehicleRepository({ vehicle: model } as any);
    const vehicle = new Vehicle(vehicleRecord({ id: undefined }) as any);
    model.create.mockResolvedValue(vehicleRecord());
    await expect(repo.create(vehicle)).resolves.toMatchObject({ publicId: 'veh-2' });
    model.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(vehicleRecord());
    await expect(repo.findById(2)).resolves.toBeNull();
    await expect(repo.findByPublicId('veh-2')).resolves.toMatchObject({ id: 2 });
    model.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(vehicleRecord());
    await expect(repo.findByCustomerAndRegistration(3, ' mh12ab1234 ')).resolves.toBeNull();
    await expect(repo.findByCustomerAndRegistration(3, ' mh12ab1234 ')).resolves.toMatchObject({ id: 2 });
    expect(model.findFirst).toHaveBeenLastCalledWith(expect.objectContaining({ where: expect.objectContaining({ registrationNumber: 'MH12AB1234' }) }));
    model.findMany.mockResolvedValue([vehicleRecord()]);
    await expect(repo.listByCustomerId(3)).resolves.toHaveLength(1);
    model.update.mockResolvedValue(vehicleRecord({ isDefault: true }));
    await repo.update(new Vehicle(vehicleRecord({ isDefault: true }) as any));
    await repo.unsetCustomerDefaultVehicles(3);
    expect(model.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({ where: { customerId: 3, id: undefined } }));
    await repo.unsetCustomerDefaultVehicles(3, 2);
    expect(model.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({ where: { customerId: 3, id: { not: 2 } } }));
    await repo.softDelete(2);
  });

  it('covers CustomerProfile lookup/list/save/delete branches', async () => {
    const model = { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() };
    const repo = new PrismaCustomerProfileRepository({ customerProfile: model } as any, () => now);
    model.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(profileRecord()).mockResolvedValueOnce(null).mockResolvedValueOnce(profileRecord());
    await expect(repo.findById(4)).resolves.toBeNull();
    await expect(repo.findById(4)).resolves.toMatchObject({ id: 4 });
    await expect(repo.findByUserId(99)).resolves.toBeNull();
    await expect(repo.findByUserId(3)).resolves.toMatchObject({ userId: 3 });
    model.findMany.mockResolvedValue([profileRecord()]);
    await expect(repo.findAll()).resolves.toHaveLength(1);
    model.create.mockResolvedValue(profileRecord());
    await repo.save(new CustomerProfile(profileRecord({ id: undefined, publicId: undefined }) as any));
    model.update.mockResolvedValue(profileRecord({ firstName: 'Updated' }));
    await repo.save(new CustomerProfile(profileRecord({ firstName: 'Updated' }) as any));
    model.update.mockResolvedValueOnce(profileRecord({ deletedAt: now }));
    await expect(repo.delete(4)).resolves.toBe(true);
    model.update.mockRejectedValueOnce(new Error('missing'));
    await expect(repo.delete(4)).resolves.toBe(false);
  });

  it('covers SetDefaultVehicle missing, wrong owner, unbookable and success branches', async () => {
    const repo = { findByPublicId: vi.fn(), unsetCustomerDefaultVehicles: vi.fn(), update: vi.fn() } as any;
    const useCase = new SetDefaultVehicleUseCase(repo);
    repo.findByPublicId.mockResolvedValueOnce(null);
    await expect(useCase.execute('missing', 3)).rejects.toThrow('not found or unauthorized');
    repo.findByPublicId.mockResolvedValueOnce(new Vehicle(vehicleRecord({ customerId: 4 }) as any));
    await expect(useCase.execute('veh-2', 3)).rejects.toThrow('not found or unauthorized');
    repo.findByPublicId.mockResolvedValueOnce(new Vehicle(vehicleRecord({ status: 'ARCHIVED' }) as any));
    await expect(useCase.execute('veh-2', 3)).rejects.toThrow('not found or unauthorized');
    const vehicle = new Vehicle(vehicleRecord() as any);
    repo.findByPublicId.mockResolvedValueOnce(vehicle);
    repo.update.mockImplementation(async (value: unknown) => value);
    const result = await useCase.execute('veh-2', 3);
    expect(repo.unsetCustomerDefaultVehicles).toHaveBeenCalledWith(3, 2);
    expect(result.isDefault).toBe(true);
  });
});
