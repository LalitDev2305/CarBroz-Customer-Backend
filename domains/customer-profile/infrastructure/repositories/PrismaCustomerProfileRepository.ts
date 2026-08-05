import { PrismaClient } from '@prisma/client';
import { ICustomerProfileRepository, CustomerProfile } from '@carbroz/common';

export class PrismaCustomerProfileRepository implements ICustomerProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<CustomerProfile | null> {
    const model = await (this.prisma as any).customerProfile.findUnique({ where: { id, deletedAt: null } });
    return model ? new CustomerProfile(model) : null;
  }

  async findByUserId(userId: number): Promise<CustomerProfile | null> {
    const model = await (this.prisma as any).customerProfile.findUnique({ where: { userId, deletedAt: null } });
    return model ? new CustomerProfile(model) : null;
  }

  async findAll(): Promise<CustomerProfile[]> {
    const models = await (this.prisma as any).customerProfile.findMany({ where: { deletedAt: null } });
    return models.map((m: any) => new CustomerProfile(m));
  }

  async save(entity: CustomerProfile): Promise<CustomerProfile> {
    const data = {
      userId: entity.userId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      dateOfBirth: entity.dateOfBirth,
      gender: entity.gender,
      marketingOptIn: entity.marketingOptIn,
    };

    if (entity.id) {
      const updated = await (this.prisma as any).customerProfile.update({
        where: { id: entity.id },
        data,
      });
      return new CustomerProfile(updated);
    } else {
      const created = await (this.prisma as any).customerProfile.create({
        data,
      });
      return new CustomerProfile(created);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await (this.prisma as any).customerProfile.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }
}
