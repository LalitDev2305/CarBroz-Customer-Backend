import { PrismaClient } from '@prisma/client';
import { Partner, PartnerStatus, PartnerType, IPartnerRepository } from '@carbroz/common';

export class PrismaPartnerRepository implements IPartnerRepository {
  private unitOfWorkPrisma: PrismaClient | null = null;

  constructor(private readonly prismaClient: PrismaClient) {}

  private get prisma(): PrismaClient {
    return this.unitOfWorkPrisma ?? this.prismaClient;
  }

  public setUnitOfWork(uow: PrismaClient): void {
    this.unitOfWorkPrisma = uow;
  }

  private mapToDomain(entity: {
    id: number;
    publicId: string;
    businessName: string;
    type: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): Partner {
    return {
      id: entity.id,
      publicId: entity.publicId,
      businessName: entity.businessName,
      type: entity.type as PartnerType,
      status: entity.status as PartnerStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }

  async findById(id: number): Promise<Partner | null> {
    const model = await this.prisma.partner.findFirst({ where: { id, deletedAt: null } });
    return model ? this.mapToDomain(model) : null;
  }

  async findByPublicId(publicId: string): Promise<Partner | null> {
    const model = await this.prisma.partner.findFirst({ where: { publicId, deletedAt: null } });
    return model ? this.mapToDomain(model) : null;
  }

  async findAll(): Promise<Partner[]> {
    const models = await this.prisma.partner.findMany({ where: { deletedAt: null } });
    return models.map((model) => this.mapToDomain(model));
  }

  async findByType(type: PartnerType): Promise<Partner[]> {
    const models = await this.prisma.partner.findMany({ where: { type, deletedAt: null } });
    return models.map((model) => this.mapToDomain(model));
  }

  async findByStatus(status: PartnerStatus): Promise<Partner[]> {
    const models = await this.prisma.partner.findMany({ where: { status, deletedAt: null } });
    return models.map((model) => this.mapToDomain(model));
  }

  async create(data: Partial<Partner>): Promise<Partner> {
    if (!data.businessName || !data.type) {
      throw new Error('Partner businessName and type are required');
    }

    const created = await this.prisma.partner.create({
      data: {
        businessName: data.businessName,
        type: data.type,
        status: data.status ?? PartnerStatus.PENDING,
        ...(data.publicId ? { publicId: data.publicId } : {}),
      },
    });
    return this.mapToDomain(created);
  }

  async save(partner: Partner): Promise<Partner> {
    if (!partner.id) return this.create(partner);

    const updated = await this.prisma.partner.update({
      where: { id: partner.id },
      data: {
        businessName: partner.businessName,
        type: partner.type,
        status: partner.status,
        deletedAt: partner.deletedAt ?? null,
      },
    });
    return this.mapToDomain(updated);
  }

  async updateStatus(id: number, status: PartnerStatus): Promise<Partner> {
    const updated = await this.prisma.partner.update({ where: { id }, data: { status } });
    return this.mapToDomain(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.partner.update({ where: { id }, data: { deletedAt: new Date() } });
      return true;
    } catch {
      return false;
    }
  }
}
