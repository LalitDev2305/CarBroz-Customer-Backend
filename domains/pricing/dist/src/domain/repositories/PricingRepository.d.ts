import { PricingTier } from '../entities/PricingTier.js';
export interface PricingRepository {
    findTier(serviceId: number, vehicleType?: string, city?: string): Promise<PricingTier | null>;
}
