import { Address } from '../../domain/Address.js';
import type { IAddressRepository } from '../../domain/repositories/IAddressRepository.js';
import type {
  AddressPersistenceClient,
  AddressPersistenceRecord,
  AddressTransactionClient,
} from '../persistence/AddressPersistenceClient.js';

export class PrismaAddressRepository implements IAddressRepository {
  constructor(
    private readonly prisma: AddressPersistenceClient,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async findById(id: number): Promise<Address | null> {
    const model = await this.prisma.address.findUnique({ where: { id, deletedAt: null } });
    return model ? this.toDomain(model) : null;
  }

  async findByUserId(userId: number): Promise<Address[]> {
    const models = await this.prisma.address.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return models.map((model) => this.toDomain(model));
  }

  async findDefaultByUserId(userId: number): Promise<Address | null> {
    const model = await this.prisma.address.findFirst({
      where: { userId, isDefault: true, deletedAt: null },
    });
    return model ? this.toDomain(model) : null;
  }

  async findAll(): Promise<Address[]> {
    const models = await this.prisma.address.findMany({ where: { deletedAt: null } });
    return models.map((model) => this.toDomain(model));
  }

  async save(entity: Address): Promise<Address> {
    const data = {
      userId: entity.userId,
      label: entity.label,
      addressLine1: entity.addressLine1,
      addressLine2: entity.addressLine2,
      city: entity.city,
      state: entity.state,
      postalCode: entity.postalCode,
      country: entity.country,
      latitude: entity.latitude,
      longitude: entity.longitude,
      isDefault: entity.isDefault,
    };

    return this.prisma.$transaction(async (tx: AddressTransactionClient) => {
      if (entity.isDefault) {
        await tx.address.updateMany({
          where: { userId: entity.userId, deletedAt: null },
          data: { isDefault: false },
        });
      }

      const model = entity.id
        ? await tx.address.update({ where: { id: entity.id }, data })
        : await tx.address.create({ data });

      return this.toDomain(model);
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.address.update({
        where: { id },
        data: { deletedAt: this.now() },
      });
      return true;
    } catch {
      return false;
    }
  }

  private toDomain(model: AddressPersistenceRecord): Address {
    return new Address({
      ...model,
      publicId: model.publicId ?? undefined,
    });
  }
}
