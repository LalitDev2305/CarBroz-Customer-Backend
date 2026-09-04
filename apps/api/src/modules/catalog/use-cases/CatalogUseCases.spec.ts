import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCatalogUseCase } from './GetCatalogUseCase.js';
import { CalculateServicePriceUseCase } from './CalculateServicePriceUseCase.js';
import { ManageCatalogUseCase } from './ManageCatalogUseCase.js';
import { ManagePricingTierUseCase } from './ManagePricingTierUseCase.js';
import { ServiceCategory, Service, ServiceAddon, VehicleTypeMultiplierEntity } from '@carbroz/common';
import type { ExecutionContext } from '@carbroz/foundation-kernel';

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

describe('Catalog & Pricing UseCases', () => {
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

  describe('GetCatalogUseCase', () => {
    it('returns categories with nested active services', async () => {
      const useCase = new GetCatalogUseCase(catalogRepo);
      const mockCategory = new ServiceCategory({ id: 1, name: 'Wash & Clean', slug: 'wash-clean', isActive: true });
      const mockService = new Service({ id: 10, categoryId: 1, name: 'Full Car Wash', slug: 'full-car-wash', basePrice: 5000 });

      catalogRepo.findAllActiveCategories.mockResolvedValue([mockCategory]);
      catalogRepo.findServicesByCategoryId.mockResolvedValue([mockService]);

      const result = await useCase.execute();

      expect(result).toHaveLength(1);
      const firstCategory = result.at(0);
      expect(firstCategory).toBeDefined();
      expect(firstCategory!.name).toBe('Wash & Clean');
      expect(firstCategory!.services).toHaveLength(1);
      expect(firstCategory!.services!.at(0)?.name).toBe('Full Car Wash');
    });
  });

  describe('CalculateServicePriceUseCase', () => {
    it('calculates dynamic price with vehicle multiplier and addons', async () => {
      const useCase = new CalculateServicePriceUseCase(catalogRepo, pricingRepo);
      const mockService = new Service({ id: 10, categoryId: 1, name: 'Full Wash', slug: 'full-wash', basePrice: 10000, isActive: true });
      const mockAddon = new ServiceAddon({ id: 100, serviceId: 10, name: 'Interior Polish', price: 2000, isActive: true });
      const mockMultiplier = new VehicleTypeMultiplierEntity({ serviceId: 10, vehicleType: 'SUV', multiplier: 1.5 });

      catalogRepo.findServiceById.mockResolvedValue(mockService);
      pricingRepo.findVehicleMultiplier.mockResolvedValue(mockMultiplier);
      catalogRepo.findAddonsByIds.mockResolvedValue([mockAddon]);

      const result = await useCase.execute({ data: { serviceId: 10, vehicleType: 'SUV', addonIds: [100] } });

      expect(result.basePrice).toBe(10000);
      expect(result.vehicleMultiplier).toBe(1.5);
      expect(result.adjustedBasePrice).toBe(15000);
      expect(result.addonsTotal).toBe(2000);
      expect(result.totalPrice).toBe(17000);
    });

    it('rejects a missing or inactive service', async () => {
      const useCase = new CalculateServicePriceUseCase(catalogRepo, pricingRepo);
      catalogRepo.findServiceById.mockResolvedValue(null);

      await expect(useCase.execute({ data: { serviceId: 99, vehicleType: 'SEDAN' } })).rejects.toThrow('NOT_FOUND');
    });
  });

  describe('ManageCatalogUseCase', () => {
    it('allows an admin actor to create a category', async () => {
      const useCase = new ManageCatalogUseCase(catalogRepo);
      catalogRepo.createCategory.mockResolvedValue(new ServiceCategory({ id: 1, name: 'Detailing', slug: 'detailing' }));

      const result = await useCase.execute({
        context: adminContext,
        data: { action: 'CREATE_CATEGORY', payload: { name: 'Detailing', slug: 'detailing' } },
      }) as ServiceCategory;

      expect(result.name).toBe('Detailing');
      expect(catalogRepo.createCategory).toHaveBeenCalledTimes(1);
    });

    it('rejects a non-admin actor', async () => {
      const useCase = new ManageCatalogUseCase(catalogRepo);

      await expect(useCase.execute({
        context: customerContext,
        data: { action: 'CREATE_CATEGORY', payload: { name: 'Test' } },
      })).rejects.toThrow('FORBIDDEN');
      expect(catalogRepo.createCategory).not.toHaveBeenCalled();
    });
  });

  describe('ManagePricingTierUseCase', () => {
    it('allows an admin actor to set a vehicle multiplier', async () => {
      const useCase = new ManagePricingTierUseCase(pricingRepo);
      pricingRepo.upsertVehicleMultiplier.mockResolvedValue(new VehicleTypeMultiplierEntity({ serviceId: 10, vehicleType: 'SUV', multiplier: 1.25 }));

      const result = await useCase.execute({
        context: adminContext,
        data: { action: 'SET_VEHICLE_MULTIPLIER', serviceId: 10, payload: { vehicleType: 'SUV', multiplier: 1.25 } },
      }) as VehicleTypeMultiplierEntity;

      expect(result.multiplier).toBe(1.25);
      expect(pricingRepo.upsertVehicleMultiplier).toHaveBeenCalledWith(10, 'SUV', 1.25);
    });

    it('rejects pricing mutation for a non-admin actor', async () => {
      const useCase = new ManagePricingTierUseCase(pricingRepo);

      await expect(useCase.execute({
        context: customerContext,
        data: { action: 'SET_VEHICLE_MULTIPLIER', serviceId: 10, payload: { vehicleType: 'SUV', multiplier: 1.25 } },
      })).rejects.toThrow('FORBIDDEN');
      expect(pricingRepo.upsertVehicleMultiplier).not.toHaveBeenCalled();
    });
  });
});
