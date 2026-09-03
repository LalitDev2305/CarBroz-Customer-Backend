import { CustomerProfile } from '../../domain/CustomerProfile.js';
import { type ICustomerProfileRepository } from '../../domain/repositories/ICustomerProfileRepository.js';
import { type CustomerProfilePersistenceClient, type CustomerProfilePersistenceRecord } from '../persistence/CustomerProfilePersistenceClient.js';

export class PrismaCustomerProfileRepository implements ICustomerProfileRepository {
  constructor(
    private readonly prisma: CustomerProfilePersistenceClient,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async findById(id: number): Promise<CustomerProfile | null> {
    const model = await this.prisma.customerProfile.findUnique({ where: { id, deletedAt: null } });
    return model ? this.toDomain(model) : null;
  }

  async findByUserId(userId: number): Promise<CustomerProfile | null> {
    const model = await this.prisma.customerProfile.findUnique({ where: { userId, deletedAt: null } });
    return model ? this.toDomain(model) : null;
  }

  async findAll(): Promise<CustomerProfile[]> {
    const models = await this.prisma.customerProfile.findMany({ where: { deletedAt: null } });
    return models.map((model: any) => this.toDomain(model));
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

    const model = entity.id
      ? await this.prisma.customerProfile.update({ where: { id: entity.id }, data })
      : await this.prisma.customerProfile.create({ data });

    return this.toDomain(model);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.customerProfile.update({
        where: { id },
        data: { deletedAt: this.now() },
      });
      return true;
    } catch {
      return false;
    }
  }

  private toDomain(model: CustomerProfilePersistenceRecord): CustomerProfile {
    const { publicId, ...rest } = model;
    return new CustomerProfile({
      ...rest,
      ...(publicId !== undefined && publicId !== null ? { publicId } : {}),
    });
  }
}
