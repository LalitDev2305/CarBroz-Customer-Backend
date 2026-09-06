import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExecutionContext } from '@carbroz/foundation-kernel';
import { Service } from '../catalog/domain/Service.js';
import { ServiceAddon } from '../catalog/domain/ServiceAddon.js';
import { ServiceCategory } from '../catalog/domain/ServiceCategory.js';
import { VehicleTypeMultiplierEntity } from '../pricing/domain/PricingTier.js';
import {
  CalculateServicePriceUseCase,
  GetCatalogUseCase,
  ManageCatalogUseCase,
  ManagePricingTierUseCase,
} from './CatalogPricingUseCases.js';

const adminContext: ExecutionContext = {
  correlationId: 'catalog-admin-test', timestamp: new Date('2026-01-01T00:00:00.000Z'),
  actor: { id: 1, kind: 'ADMIN', roles: ['ADMIN'] },
};
const roleAdminContext: ExecutionContext = {
  correlationId: 'catalog-role-admin-test', timestamp: new Date('2026-01-01T00:00:00.000Z'),
  actor: { id: 3, kind: 'CUSTOMER', roles: ['ADMIN'] },
};
const customerContext: ExecutionContext = {
  correlationId: 'catalog-customer-test', timestamp: new Date('2026-01-01T00:00:00.000Z'),
  actor: { id: 2, kind: 'CUSTOMER', roles: ['CUSTOMER'], customerId: 2 },
};

describe('Catalog/Pricing application use cases', () => {
  let catalogRepo: any;
  let pricingRepo: any;

  beforeEach(() => {
    catalogRepo = {
      findAllActiveCategories: vi.fn(), findServicesByCategoryId: vi.fn(), findServiceById: vi.fn(),
      findAddonsByIds: vi.fn(), createCategory: vi.fn(), updateCategory: vi.fn(), createService: vi.fn(),
      updateService: vi.fn(), createAddon: vi.fn(),
    };
    pricingRepo = { findVehicleMultiplier: vi.fn(), createPricingTier: vi.fn(), upsertVehicleMultiplier: vi.fn() };
  });

  it('returns active categories with services', async () => {
    catalogRepo.findAllActiveCategories.mockResolvedValue([new ServiceCategory({ id: 1, name: 'Wash & Clean', slug: 'wash-clean', isActive: true })]);
    catalogRepo.findServicesByCategoryId.mockResolvedValue([new Service({ id: 10, categoryId: 1, name: 'Full Car Wash', slug: 'full-car-wash', basePrice: 5000 })]);
    const result = await new GetCatalogUseCase(catalogRepo).execute();
    expect(result.at(0)?.services?.at(0)?.name).toBe('Full Car Wash');
  });

  it('calculates adjusted price, filters invalid addons, and normalizes vehicle type', async () => {
    catalogRepo.findServiceById.mockResolvedValue(new Service({ id: 10, categoryId: 1, name: 'Full Wash', slug: 'full-wash', basePrice: 10000, isActive: true }));
    pricingRepo.findVehicleMultiplier.mockResolvedValue(new VehicleTypeMultiplierEntity({ serviceId: 10, vehicleType: 'SUV', multiplier: 1.5 }));
    catalogRepo.findAddonsByIds.mockResolvedValue([
      new ServiceAddon({ id: 100, serviceId: 10, name: 'Interior Polish', price: 2000, isActive: true }),
      new ServiceAddon({ id: 101, serviceId: 11, name: 'Other service', price: 9000, isActive: true }),
      new ServiceAddon({ id: 102, serviceId: 10, name: 'Inactive', price: 9000, isActive: false }),
    ]);
    const result = await new CalculateServicePriceUseCase(catalogRepo, pricingRepo).execute({ data: { serviceId: 10, vehicleType: 'suv', addonIds: [100, 101, 102] } });
    expect(result).toMatchObject({ vehicleType: 'SUV', vehicleMultiplier: 1.5, addonsTotal: 2000, totalPrice: 17000 });
    expect(result.addons).toHaveLength(1);
  });

  it('uses default multiplier and skips addon lookup when no addons are requested', async () => {
    catalogRepo.findServiceById.mockResolvedValue(new Service({ id: 10, categoryId: 1, name: 'Wash', slug: 'wash', basePrice: 9999, isActive: true }));
    pricingRepo.findVehicleMultiplier.mockResolvedValue(null);
    const result = await new CalculateServicePriceUseCase(catalogRepo, pricingRepo).execute({ data: { serviceId: 10, vehicleType: 'sedan' } });
    expect(result).toMatchObject({ vehicleMultiplier: 1, adjustedBasePrice: 9999, addonsTotal: 0, totalPrice: 9999 });
    expect(catalogRepo.findAddonsByIds).not.toHaveBeenCalled();
  });

  it('rejects missing and inactive services', async () => {
    const useCase = new CalculateServicePriceUseCase(catalogRepo, pricingRepo);
    catalogRepo.findServiceById.mockResolvedValueOnce(null).mockResolvedValueOnce(new Service({ id: 10, categoryId: 1, name: 'Inactive', slug: 'inactive', basePrice: 1, isActive: false }));
    await expect(useCase.execute({ data: { serviceId: 99, vehicleType: 'SEDAN' } })).rejects.toThrow('NOT_FOUND');
    await expect(useCase.execute({ data: { serviceId: 10, vehicleType: 'SEDAN' } })).rejects.toThrow('NOT_FOUND');
  });

  it('covers every catalog mutation action and required-id validation', async () => {
    const useCase = new ManageCatalogUseCase(catalogRepo);
    catalogRepo.createCategory.mockResolvedValue({ kind: 'category' }); catalogRepo.updateCategory.mockResolvedValue({ kind: 'category-update' });
    catalogRepo.createService.mockResolvedValue({ kind: 'service' }); catalogRepo.updateService.mockResolvedValue({ kind: 'service-update' }); catalogRepo.createAddon.mockResolvedValue({ kind: 'addon' });
    await expect(useCase.execute({ context: adminContext, data: { action: 'CREATE_CATEGORY', payload: { name: 'Detailing' } } })).resolves.toEqual({ kind: 'category' });
    await expect(useCase.execute({ context: roleAdminContext, data: { action: 'UPDATE_CATEGORY', categoryId: 7, payload: { name: 'Updated' } } })).resolves.toEqual({ kind: 'category-update' });
    await expect(useCase.execute({ context: adminContext, data: { action: 'CREATE_SERVICE', payload: { name: 'Wash' } } })).resolves.toEqual({ kind: 'service' });
    await expect(useCase.execute({ context: adminContext, data: { action: 'UPDATE_SERVICE', serviceId: 8, payload: { name: 'Updated' } } })).resolves.toEqual({ kind: 'service-update' });
    await expect(useCase.execute({ context: adminContext, data: { action: 'CREATE_ADDON', payload: { name: 'Polish' } } })).resolves.toEqual({ kind: 'addon' });
    await expect(useCase.execute({ context: adminContext, data: { action: 'UPDATE_CATEGORY', payload: {} } })).rejects.toThrow('categoryId required');
    await expect(useCase.execute({ context: adminContext, data: { action: 'UPDATE_SERVICE', payload: {} } })).rejects.toThrow('serviceId required');
    await expect(useCase.execute({ context: adminContext, data: { action: 'INVALID' as never, payload: {} } })).rejects.toThrow('Invalid catalog management action');
    await expect(useCase.execute({ context: customerContext, data: { action: 'CREATE_CATEGORY', payload: {} } })).rejects.toThrow('FORBIDDEN');
  });

  it('covers pricing creation, multiplier validation, role-admin authorization, and invalid action', async () => {
    const useCase = new ManagePricingTierUseCase(pricingRepo);
    pricingRepo.createPricingTier.mockResolvedValue({ id: 1 });
    pricingRepo.upsertVehicleMultiplier.mockResolvedValue(new VehicleTypeMultiplierEntity({ serviceId: 10, vehicleType: 'SUV', multiplier: 1.25 }));
    await expect(useCase.execute({ context: adminContext, data: { action: 'CREATE_TIER', serviceId: 10, payload: { name: 'Premium' } } })).resolves.toEqual({ id: 1 });
    await expect(useCase.execute({ context: roleAdminContext, data: { action: 'SET_VEHICLE_MULTIPLIER', serviceId: 10, payload: { vehicleType: 'suv', multiplier: 1.25 } } })).resolves.toMatchObject({ multiplier: 1.25 });
    await expect(useCase.execute({ context: adminContext, data: { action: 'SET_VEHICLE_MULTIPLIER', serviceId: 10, payload: { vehicleType: 1, multiplier: 1.25 } } })).rejects.toThrow('vehicleType and multiplier required');
    await expect(useCase.execute({ context: adminContext, data: { action: 'SET_VEHICLE_MULTIPLIER', serviceId: 10, payload: { vehicleType: 'SUV' } } })).rejects.toThrow('vehicleType and multiplier required');
    await expect(useCase.execute({ context: adminContext, data: { action: 'INVALID' as never, serviceId: 10, payload: {} } })).rejects.toThrow('Invalid pricing management action');
    await expect(useCase.execute({ context: customerContext, data: { action: 'CREATE_TIER', serviceId: 10, payload: {} } })).rejects.toThrow('FORBIDDEN');
  });
});
