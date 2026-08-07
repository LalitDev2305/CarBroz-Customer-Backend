import { IPricingRepository, PricingTier, VehicleTypeMultiplierEntity } from '@carbroz/foundation-kernel';
import { PrismaProvider } from '../providers/PrismaProvider.js';
export declare class PrismaPricingRepository implements IPricingRepository {
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