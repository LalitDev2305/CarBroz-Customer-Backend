import { IUseCase, ICatalogRepository, IPricingRepository } from '@carbroz/common';

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

/** Calculates a service price from catalog data and pricing policy without transport context. */
export class CalculateServicePriceUseCase implements IUseCase<{ data: CalculatePriceRequest }, CalculatedPriceResult> {
  constructor(
    private readonly catalogRepository: ICatalogRepository,
    private readonly pricingRepository: IPricingRepository
  ) {}

  async execute(request: { data: CalculatePriceRequest }): Promise<CalculatedPriceResult> {
    const { serviceId, vehicleType, addonIds = [] } = request.data;

    const service = await this.catalogRepository.findServiceById(serviceId);
    if (!service || !service.isActive) {
      throw new Error('NOT_FOUND: Service not found or inactive');
    }

    const multiplierEntity = await this.pricingRepository.findVehicleMultiplier(serviceId, vehicleType.toUpperCase());
    const vehicleMultiplier = multiplierEntity ? multiplierEntity.multiplier : 1.0;
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
      vehicleType: vehicleType.toUpperCase(),
      basePrice: service.basePrice,
      vehicleMultiplier,
      adjustedBasePrice,
      addonsTotal,
      addons: selectedAddons,
      totalPrice: adjustedBasePrice + addonsTotal,
    };
  }
}
