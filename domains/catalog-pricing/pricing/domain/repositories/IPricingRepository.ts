import type { PricingTier, VehicleTypeMultiplierEntity } from '../PricingTier.js';

export interface IPricingRepository {
  findTiersByServiceId(serviceId: number): Promise<PricingTier[]>;
  findDefaultTierByServiceId(serviceId: number): Promise<PricingTier | null>;
  createPricingTier(tier: Partial<PricingTier>): Promise<PricingTier>;

  findVehicleMultiplier(
    serviceId: number,
    vehicleType: string,
  ): Promise<VehicleTypeMultiplierEntity | null>;
  upsertVehicleMultiplier(
    serviceId: number,
    vehicleType: string,
    multiplier: number,
  ): Promise<VehicleTypeMultiplierEntity>;
}
