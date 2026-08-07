import { PrismaClient } from '@prisma/client';
import { IPricingRepository, PricingTier, VehicleTypeMultiplierEntity } from '@carbroz/common';
export declare class PrismaPricingRepository implements IPricingRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findTiersByServiceId(serviceId: number): Promise<PricingTier[]>;
    findDefaultTierByServiceId(serviceId: number): Promise<PricingTier | null>;
    createPricingTier(tier: Partial<PricingTier>): Promise<PricingTier>;
    findVehicleMultiplier(serviceId: number, vehicleType: string): Promise<VehicleTypeMultiplierEntity | null>;
    upsertVehicleMultiplier(serviceId: number, vehicleType: string, multiplier: number): Promise<VehicleTypeMultiplierEntity>;
}
//# sourceMappingURL=PrismaPricingRepository.d.ts.map