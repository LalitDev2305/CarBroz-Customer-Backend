import { PrismaClient } from '@prisma/client';
import type { IPricingRepository } from '../../domain/repositories/IPricingRepository.js';
import { PricingTier, VehicleTypeMultiplierEntity } from '../../domain/PricingTier.js';

export class PrismaPricingRepository implements IPricingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findTiersByServiceId(serviceId: number): Promise<PricingTier[]> {
    const models = await this.prisma.pricingTier.findMany({ where: { serviceId } });
    return models.map(m => new PricingTier(m));
  }

  async findDefaultTierByServiceId(serviceId: number): Promise<PricingTier | null> {
    const model = await this.prisma.pricingTier.findFirst({ where: { serviceId, isDefault: true } });
    return model ? new PricingTier(model) : null;
  }

  async createPricingTier(tier: Partial<PricingTier>): Promise<PricingTier> {
    if (tier.isDefault) {
      await this.prisma.pricingTier.updateMany({ where: { serviceId: tier.serviceId }, data: { isDefault: false } });
    }
    const created = await this.prisma.pricingTier.create({
      data: {
        serviceId: tier.serviceId!,
        name: tier.name!,
        flatPrice: tier.flatPrice!,
        isDefault: tier.isDefault ?? false
      }
    });
    return new PricingTier(created);
  }

  async findVehicleMultiplier(serviceId: number, vehicleType: string): Promise<VehicleTypeMultiplierEntity | null> {
    const model = await this.prisma.vehicleTypeMultiplier.findUnique({
      where: { serviceId_vehicleType: { serviceId, vehicleType } }
    });
    return model ? new VehicleTypeMultiplierEntity(model) : null;
  }

  async upsertVehicleMultiplier(serviceId: number, vehicleType: string, multiplier: number): Promise<VehicleTypeMultiplierEntity> {
    const model = await this.prisma.vehicleTypeMultiplier.upsert({
      where: { serviceId_vehicleType: { serviceId, vehicleType } },
      update: { multiplier },
      create: { serviceId, vehicleType, multiplier }
    });
    return new VehicleTypeMultiplierEntity(model);
  }
}
