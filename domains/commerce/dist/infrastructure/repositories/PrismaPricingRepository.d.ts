import { PrismaProvider } from '@carbroz/platform-database';
import { PricingTier, VehicleTypeMultiplierEntity } from '../../domain/PricingTier.js';
export declare class PrismaPricingRepository {
    private readonly prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    findTiersByServiceId(serviceId: number): Promise<PricingTier[]>;
    findDefaultTierByServiceId(serviceId: number): Promise<PricingTier | null>;
    createPricingTier(tier: Partial<PricingTier>): Promise<PricingTier>;
    findVehicleMultiplier(serviceId: number, vehicleType: string): Promise<VehicleTypeMultiplierEntity | null>;
    upsertVehicleMultiplier(serviceId: number, vehicleType: string, multiplier: number): Promise<VehicleTypeMultiplierEntity>;
}
//# sourceMappingURL=PrismaPricingRepository.d.ts.map