import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import type { Service } from '../catalog/domain/Service.js';
import type { ServiceCategory } from '../catalog/domain/ServiceCategory.js';
import type { ICatalogRepository } from '../catalog/domain/repositories/ICatalogRepository.js';
import type { IPricingRepository } from '../pricing/domain/repositories/IPricingRepository.js';

export interface CategoryWithServices extends ServiceCategory {
  services?: Service[];
}

/** Returns the active Catalog/Pricing catalog without depending on HTTP transport. */
export class GetCatalogUseCase implements IUseCase<void, CategoryWithServices[]> {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(): Promise<CategoryWithServices[]> {
    const categories = await this.catalogRepository.findAllActiveCategories();
    return Promise.all(
      categories.map(async (category) => ({
        ...category,
        services: await this.catalogRepository.findServicesByCategoryId(category.id!),
      })),
    );
  }
}

export interface CalculatePriceRequest {
  serviceId: number;
  vehicleType: string;
  addonIds?: number[];
}

export interface CalculatedPriceResult {
  serviceId: number;
  serviceName: string;
  vehicleType: string;
  basePrice: number;
  vehicleMultiplier: number;
  adjustedBasePrice: number;
  addonsTotal: number;
  addons: Array<{ id: number; name: string; price: number }>;
  totalPrice: number;
}

/** Calculates service pricing from Catalog/Pricing-owned repository ports. */
export class CalculateServicePriceUseCase
  implements IUseCase<{ data: CalculatePriceRequest }, CalculatedPriceResult>
{
  constructor(
    private readonly catalogRepository: ICatalogRepository,
    private readonly pricingRepository: IPricingRepository,
  ) {}

  async execute(request: { data: CalculatePriceRequest }): Promise<CalculatedPriceResult> {
    const { serviceId, vehicleType, addonIds = [] } = request.data;
    const service = await this.catalogRepository.findServiceById(serviceId);
    if (!service || !service.isActive) {
      throw new Error('NOT_FOUND: Service not found or inactive');
    }

    const normalizedVehicleType = vehicleType.toUpperCase();
    const multiplierEntity = await this.pricingRepository.findVehicleMultiplier(
      serviceId,
      normalizedVehicleType,
    );
    const vehicleMultiplier = multiplierEntity?.multiplier ?? 1.0;
    const adjustedBasePrice = Math.round(service.basePrice * vehicleMultiplier);
    let addonsTotal = 0;
    const selectedAddons: Array<{ id: number; name: string; price: number }> = [];

    if (addonIds.length > 0) {
      const addons = await this.catalogRepository.findAddonsByIds(addonIds);
      for (const addon of addons) {
        if (addon.serviceId === serviceId && addon.isActive) {
          addonsTotal += addon.price;
          selectedAddons.push({ id: addon.id!, name: addon.name, price: addon.price });
        }
      }
    }

    return {
      serviceId: service.id!,
      serviceName: service.name,
      vehicleType: normalizedVehicleType,
      basePrice: service.basePrice,
      vehicleMultiplier,
      adjustedBasePrice,
      addonsTotal,
      addons: selectedAddons,
      totalPrice: adjustedBasePrice + addonsTotal,
    };
  }
}

export interface ManageCatalogRequest {
  action: 'CREATE_CATEGORY' | 'UPDATE_CATEGORY' | 'CREATE_SERVICE' | 'UPDATE_SERVICE' | 'CREATE_ADDON';
  categoryId?: number;
  serviceId?: number;
  addonId?: number;
  payload: unknown;
}

/** Admin-only Catalog mutation orchestration owned by the Catalog/Pricing bounded context. */
export class ManageCatalogUseCase
  implements IUseCase<{ context: ExecutionContext; data: ManageCatalogRequest }, unknown>
{
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(request: { context: ExecutionContext; data: ManageCatalogRequest }): Promise<unknown> {
    const actor = request.context.actor;
    if (actor?.kind !== 'ADMIN' && !actor?.roles.includes('ADMIN')) {
      throw new Error('FORBIDDEN: Admin privileges required');
    }

    const { action, categoryId, serviceId, payload } = request.data;
    switch (action) {
      case 'CREATE_CATEGORY':
        return this.catalogRepository.createCategory(payload as Parameters<ICatalogRepository['createCategory']>[0]);
      case 'UPDATE_CATEGORY':
        if (!categoryId) throw new Error('BAD_REQUEST: categoryId required');
        return this.catalogRepository.updateCategory(
          categoryId,
          payload as Parameters<ICatalogRepository['updateCategory']>[1],
        );
      case 'CREATE_SERVICE':
        return this.catalogRepository.createService(payload as Parameters<ICatalogRepository['createService']>[0]);
      case 'UPDATE_SERVICE':
        if (!serviceId) throw new Error('BAD_REQUEST: serviceId required');
        return this.catalogRepository.updateService(
          serviceId,
          payload as Parameters<ICatalogRepository['updateService']>[1],
        );
      case 'CREATE_ADDON':
        return this.catalogRepository.createAddon(payload as Parameters<ICatalogRepository['createAddon']>[0]);
      default:
        throw new Error('BAD_REQUEST: Invalid catalog management action');
    }
  }
}

export interface ManagePricingRequest {
  action: 'CREATE_TIER' | 'SET_VEHICLE_MULTIPLIER';
  serviceId: number;
  payload: Record<string, unknown>;
}

/** Admin-only Pricing mutation orchestration owned by the Catalog/Pricing bounded context. */
export class ManagePricingTierUseCase
  implements IUseCase<{ context: ExecutionContext; data: ManagePricingRequest }, unknown>
{
  constructor(private readonly pricingRepository: IPricingRepository) {}

  async execute(request: { context: ExecutionContext; data: ManagePricingRequest }): Promise<unknown> {
    const actor = request.context.actor;
    if (actor?.kind !== 'ADMIN' && !actor?.roles.includes('ADMIN')) {
      throw new Error('FORBIDDEN: Admin privileges required');
    }

    const { action, serviceId, payload } = request.data;
    switch (action) {
      case 'CREATE_TIER':
        return this.pricingRepository.createPricingTier({ serviceId, ...payload } as Parameters<IPricingRepository['createPricingTier']>[0]);
      case 'SET_VEHICLE_MULTIPLIER': {
        const vehicleType = payload.vehicleType;
        const multiplier = payload.multiplier;
        if (typeof vehicleType !== 'string' || typeof multiplier !== 'number') {
          throw new Error('BAD_REQUEST: vehicleType and multiplier required');
        }
        return this.pricingRepository.upsertVehicleMultiplier(
          serviceId,
          vehicleType.toUpperCase(),
          multiplier,
        );
      }
      default:
        throw new Error('BAD_REQUEST: Invalid pricing management action');
    }
  }
}
