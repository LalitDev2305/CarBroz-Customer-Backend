import type { PricingTier, VehicleTypeMultiplierEntity } from '../PricingTier.js';

/** IPricingRepository is an exported domains/catalog-pricing contract/implementation; see the owning README for lifecycle and extension rules. */
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
