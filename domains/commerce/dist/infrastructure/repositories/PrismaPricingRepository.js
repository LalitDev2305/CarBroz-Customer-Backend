import { PricingTier, VehicleTypeMultiplierEntity } from '../../domain/PricingTier.js';
export class PrismaPricingRepository {
    prismaProvider;
    constructor(prismaProvider) {
        this.prismaProvider = prismaProvider;
    }
    get prisma() {
        return this.prismaProvider.getClient();
    }
    async findTiersByServiceId(serviceId) {
        const models = await this.prisma.pricingTier.findMany({
            where: { serviceId }
        });
        return models.map(m => new PricingTier(m));
    }
    async findDefaultTierByServiceId(serviceId) {
        const model = await this.prisma.pricingTier.findFirst({
            where: { serviceId, isDefault: true }
        });
        return model ? new PricingTier(model) : null;
    }
    async createPricingTier(tier) {
        if (tier.isDefault) {
            await this.prisma.pricingTier.updateMany({
                where: { serviceId: tier.serviceId },
                data: { isDefault: false }
            });
        }
        const created = await this.prisma.pricingTier.create({
            data: {
                serviceId: tier.serviceId,
                name: tier.name,
                flatPrice: tier.flatPrice,
                isDefault: tier.isDefault ?? false
            }
        });
        return new PricingTier(created);
    }
    async findVehicleMultiplier(serviceId, vehicleType) {
        const model = await this.prisma.vehicleTypeMultiplier.findUnique({
            where: {
                serviceId_vehicleType: {
                    serviceId,
                    vehicleType
                }
            }
        });
        return model ? new VehicleTypeMultiplierEntity(model) : null;
    }
    async upsertVehicleMultiplier(serviceId, vehicleType, multiplier) {
        const model = await this.prisma.vehicleTypeMultiplier.upsert({
            where: {
                serviceId_vehicleType: {
                    serviceId,
                    vehicleType
                }
            },
            update: { multiplier },
            create: {
                serviceId,
                vehicleType,
                multiplier
            }
        });
        return new VehicleTypeMultiplierEntity(model);
    }
}
//# sourceMappingURL=PrismaPricingRepository.js.map