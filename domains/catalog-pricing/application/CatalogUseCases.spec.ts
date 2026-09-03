import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCatalogUseCase } from './GetCatalogUseCase.js';
import { CalculateServicePriceUseCase } from './CalculateServicePriceUseCase.js';
import { ManageCatalogUseCase } from './ManageCatalogUseCase.js';
import { ManagePricingTierUseCase } from './ManagePricingTierUseCase.js';
import { ServiceCategory } from '../catalog/domain/ServiceCategory.js';
import { Service } from '../catalog/domain/Service.js';
import { ServiceAddon } from '../catalog/domain/ServiceAddon.js';
import { PricingTier, VehicleTypeMultiplierEntity } from '../pricing/domain/PricingTier.js';

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
    it('should return categories with nested active services', async () => {
      const useCase = new GetCatalogUseCase(catalogRepo);
      const mockCategory = new ServiceCategory({ id: 1, name: 'Wash & Clean', slug: 'wash-clean', isActive: true });
      const mockService = new Service({ id: 10, categoryId: 1, name: 'Full Car Wash', slug: 'full-car-wash', basePrice: 5000 });

      catalogRepo.findAllActiveCategories.mockResolvedValue([mockCategory]);
      catalogRepo.findServicesByCategoryId.mockResolvedValue([mockService]);

      const result = await useCase.execute();

      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('Wash & Clean');
      expect(result[0]!.services).toHaveLength(1);
      expect(result[0]!.services![0]!.name).toBe('Full Car Wash');
    });
  });

  describe('CalculateServicePriceUseCase', () => {
    it('should calculate dynamic price with vehicle multiplier and addons', async () => {
      const useCase = new CalculateServicePriceUseCase(catalogRepo, pricingRepo);
      const mockService = new Service({ id: 10, categoryId: 1, name: 'Full Wash', slug: 'full-wash', basePrice: 10000, isActive: true });
      const mockAddon = new ServiceAddon({ id: 100, serviceId: 10, name: 'Interior Polish', price: 2000, isActive: true });
      const mockMultiplier = new VehicleTypeMultiplierEntity({ serviceId: 10, vehicleType: 'SUV', multiplier: 1.5 });

      catalogRepo.findServiceById.mockResolvedValue(mockService);
      pricingRepo.findVehicleMultiplier.mockResolvedValue(mockMultiplier);
      catalogRepo.findAddonsByIds.mockResolvedValue([mockAddon]);

      const result = await useCase.execute({
        data: {
          serviceId: 10,
          vehicleType: 'SUV',
          addonIds: [100]
        }
      });

      expect(result.basePrice).toBe(10000);
      expect(result.vehicleMultiplier).toBe(1.5);
      expect(result.adjustedBasePrice).toBe(15000);
      expect(result.addonsTotal).toBe(2000);
      expect(result.totalPrice).toBe(17000);
    });

    it('should throw NOT_FOUND if service does not exist', async () => {
      const useCase = new CalculateServicePriceUseCase(catalogRepo, pricingRepo);
      catalogRepo.findServiceById.mockResolvedValue(null);

      await expect(useCase.execute({
        data: { serviceId: 99, vehicleType: 'SEDAN' }
      })).rejects.toThrow('NOT_FOUND');
    });
  });

  describe('ManageCatalogUseCase', () => {
    it('should allow admin to create category', async () => {
      const useCase = new ManageCatalogUseCase(catalogRepo);
      catalogRepo.createCategory.mockResolvedValue(new ServiceCategory({ id: 1, name: 'Detailing', slug: 'detailing' }));

      const result = await useCase.execute({
        context: { authenticatedUser: { id: 1, isAdmin: true } } as any,
        data: { action: 'CREATE_CATEGORY', payload: { name: 'Detailing', slug: 'detailing' } }
      });

      expect(result.name).toBe('Detailing');
      expect(catalogRepo.createCategory).toHaveBeenCalled();
    });

    it('should throw FORBIDDEN if user is not admin', async () => {
      const useCase = new ManageCatalogUseCase(catalogRepo);

      await expect(useCase.execute({
        context: { authenticatedUser: { id: 2, isAdmin: false } } as any,
        data: { action: 'CREATE_CATEGORY', payload: { name: 'Test' } }
      })).rejects.toThrow('FORBIDDEN');
    });
  });

  describe('ManagePricingTierUseCase', () => {
    it('should allow admin to set vehicle multiplier', async () => {
      const useCase = new ManagePricingTierUseCase(pricingRepo);
      pricingRepo.upsertVehicleMultiplier.mockResolvedValue(new VehicleTypeMultiplierEntity({ serviceId: 10, vehicleType: 'SUV', multiplier: 1.25 }));

      const result = await useCase.execute({
        context: { authenticatedUser: { id: 1, isAdmin: true } } as any,
        data: { action: 'SET_VEHICLE_MULTIPLIER', serviceId: 10, payload: { vehicleType: 'SUV', multiplier: 1.25 } }
      });

      expect(result.multiplier).toBe(1.25);
      expect(pricingRepo.upsertVehicleMultiplier).toHaveBeenCalledWith(10, 'SUV', 1.25);
    });
  });
});
