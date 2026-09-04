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
  correlationId: 'catalog-admin-test',
  timestamp: new Date('2026-01-01T00:00:00.000Z'),
  actor: { id: 1, kind: 'ADMIN', roles: ['ADMIN'] },
};

const customerContext: ExecutionContext = {
  correlationId: 'catalog-customer-test',
  timestamp: new Date('2026-01-01T00:00:00.000Z'),
  actor: { id: 2, kind: 'CUSTOMER', roles: ['CUSTOMER'], customerId: 2 },
};

describe('Catalog/Pricing application use cases', () => {
  let catalogRepo: any;
  let pricingRepo: any;

  beforeEach(() => {
    catalogRepo = {
      findAllActiveCategories: vi.fn(),
      findServicesByCategoryId: vi.fn(),
      findServiceById: vi.fn(),
      findAddonsByIds: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      createService: vi.fn(),
      updateService: vi.fn(),
      createAddon: vi.fn(),
    };
    pricingRepo = {
      findVehicleMultiplier: vi.fn(),
      createPricingTier: vi.fn(),
      upsertVehicleMultiplier: vi.fn(),
    };
  });

  it('returns active categories with services', async () => {
    const useCase = new GetCatalogUseCase(catalogRepo);
    catalogRepo.findAllActiveCategories.mockResolvedValue([
      new ServiceCategory({ id: 1, name: 'Wash & Clean', slug: 'wash-clean', isActive: true }),
    ]);
    catalogRepo.findServicesByCategoryId.mockResolvedValue([
      new Service({ id: 10, categoryId: 1, name: 'Full Car Wash', slug: 'full-car-wash', basePrice: 5000 }),
    ]);

    const result = await useCase.execute();
    expect(result.at(0)?.services?.at(0)?.name).toBe('Full Car Wash');
  });

  it('calculates vehicle-adjusted price and valid addons', async () => {
    const useCase = new CalculateServicePriceUseCase(catalogRepo, pricingRepo);
    catalogRepo.findServiceById.mockResolvedValue(
      new Service({ id: 10, categoryId: 1, name: 'Full Wash', slug: 'full-wash', basePrice: 10000, isActive: true }),
    );
    pricingRepo.findVehicleMultiplier.mockResolvedValue(
      new VehicleTypeMultiplierEntity({ serviceId: 10, vehicleType: 'SUV', multiplier: 1.5 }),
    );
    catalogRepo.findAddonsByIds.mockResolvedValue([
      new ServiceAddon({ id: 100, serviceId: 10, name: 'Interior Polish', price: 2000, isActive: true }),
    ]);

    const result = await useCase.execute({ data: { serviceId: 10, vehicleType: 'suv', addonIds: [100] } });
    expect(result.vehicleType).toBe('SUV');
    expect(result.totalPrice).toBe(17000);
  });

  it('rejects a missing or inactive service', async () => {
    const useCase = new CalculateServicePriceUseCase(catalogRepo, pricingRepo);
    catalogRepo.findServiceById.mockResolvedValue(null);
    await expect(useCase.execute({ data: { serviceId: 99, vehicleType: 'SEDAN' } })).rejects.toThrow('NOT_FOUND');
  });

  it('allows admin catalog mutation and rejects non-admin mutation', async () => {
    const useCase = new ManageCatalogUseCase(catalogRepo);
    catalogRepo.createCategory.mockResolvedValue(
      new ServiceCategory({ id: 1, name: 'Detailing', slug: 'detailing' }),
    );

    await expect(useCase.execute({
      context: adminContext,
      data: { action: 'CREATE_CATEGORY', payload: { name: 'Detailing', slug: 'detailing' } },
    })).resolves.toMatchObject({ name: 'Detailing' });

    await expect(useCase.execute({
      context: customerContext,
      data: { action: 'CREATE_CATEGORY', payload: { name: 'Forbidden' } },
    })).rejects.toThrow('FORBIDDEN');
  });

  it('validates pricing mutation payload and rejects non-admin mutation', async () => {
    const useCase = new ManagePricingTierUseCase(pricingRepo);
    pricingRepo.upsertVehicleMultiplier.mockResolvedValue(
      new VehicleTypeMultiplierEntity({ serviceId: 10, vehicleType: 'SUV', multiplier: 1.25 }),
    );

    await expect(useCase.execute({
      context: adminContext,
      data: { action: 'SET_VEHICLE_MULTIPLIER', serviceId: 10, payload: { vehicleType: 'SUV', multiplier: 1.25 } },
    })).resolves.toMatchObject({ multiplier: 1.25 });

    await expect(useCase.execute({
      context: adminContext,
      data: { action: 'SET_VEHICLE_MULTIPLIER', serviceId: 10, payload: { vehicleType: 'SUV' } },
    })).rejects.toThrow('BAD_REQUEST');

    await expect(useCase.execute({
      context: customerContext,
      data: { action: 'SET_VEHICLE_MULTIPLIER', serviceId: 10, payload: { vehicleType: 'SUV', multiplier: 1.25 } },
    })).rejects.toThrow('FORBIDDEN');
  });
});
