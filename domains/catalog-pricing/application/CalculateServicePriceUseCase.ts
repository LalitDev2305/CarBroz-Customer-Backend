import { type IUseCase, type IRequestContext } from '@carbroz/foundation-kernel';
import { type ICatalogRepository } from '../catalog/domain/repositories/ICatalogRepository.js';
import { type IPricingRepository } from '../pricing/domain/repositories/IPricingRepository.js';

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

export class CalculateServicePriceUseCase implements IUseCase<{ context?: IRequestContext; data: CalculatePriceRequest }, CalculatedPriceResult> {
  constructor(
    private readonly catalogRepository: ICatalogRepository,
    private readonly pricingRepository: IPricingRepository
  ) {}

  async execute(request: { context?: IRequestContext; data: CalculatePriceRequest }): Promise<CalculatedPriceResult> {
    const { serviceId, vehicleType, addonIds = [] } = request.data;

    const service = await this.catalogRepository.findServiceById(serviceId);
    if (!service || !service.isActive) {
      throw new Error('NOT_FOUND: Service not found or inactive');
    }

    // Get Vehicle Multiplier
    const multiplierEntity = await this.pricingRepository.findVehicleMultiplier(serviceId, vehicleType.toUpperCase());
    const vehicleMultiplier = multiplierEntity ? multiplierEntity.multiplier : 1.0;

    const adjustedBasePrice = Math.round(service.basePrice * vehicleMultiplier);

    // Get Selected Addons
    let addonsTotal = 0;
    const selectedAddons: Array<{ id: number; name: string; price: number }> = [];

    if (addonIds.length > 0) {
      const addons = await this.catalogRepository.findAddonsByIds(addonIds);
      for (const addon of addons) {
        if (addon.serviceId === serviceId && addon.isActive) {
          addonsTotal += addon.price;
          selectedAddons.push({
            id: addon.id!,
            name: addon.name,
            price: addon.price
          });
        }
      }
    }

    const totalPrice = adjustedBasePrice + addonsTotal;

    return {
      serviceId: service.id!,
      serviceName: service.name,
      vehicleType: vehicleType.toUpperCase(),
      basePrice: service.basePrice,
      vehicleMultiplier,
      adjustedBasePrice,
      addonsTotal,
      addons: selectedAddons,
      totalPrice
    };
  }
}
