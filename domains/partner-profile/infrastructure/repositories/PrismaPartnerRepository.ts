import { PrismaClient } from '@prisma/client';
import { Partner, PartnerStatus, PartnerType, IPartnerRepository } from '@carbroz/common';

export class PrismaPartnerRepository implements IPartnerRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaClient: PrismaClient) {}

  private get prisma() {
    return this.unitOfWorkPrisma || this.prismaClient;
  }

  public setUnitOfWork(uow: any): void {
    this.unitOfWorkPrisma = uow;
  }

  private mapToDomain(entity: any): Partner {
    return new Partner(entity);
  }

  async findById(id: number): Promise<Partner | null> {
    const model = await this.prisma.partner.findUnique({ where: { id, deletedAt: null } });
    return model ? this.mapToDomain(model) : null;
  }

  async findByPublicId(publicId: string): Promise<Partner | null> {
    const model = await this.prisma.partner.findUnique({ where: { publicId, deletedAt: null } });
    return model ? this.mapToDomain(model) : null;
  }

  async findByCode(code: string): Promise<Partner | null> {
    const model = await this.prisma.partner.findUnique({ where: { code, deletedAt: null } });
    return model ? this.mapToDomain(model) : null;
  }

  async findAll(): Promise<Partner[]> {
    const models = await this.prisma.partner.findMany({ where: { deletedAt: null } });
    return models.map((m: any) => this.mapToDomain(m));
  }

  async findByType(type: PartnerType): Promise<Partner[]> {
    const models = await this.prisma.partner.findMany({ where: { type, deletedAt: null } });
    return models.map((m: any) => this.mapToDomain(m));
  }

  async findByStatus(status: PartnerStatus): Promise<Partner[]> {
    const models = await this.prisma.partner.findMany({ where: { status, deletedAt: null } });
    return models.map((m: any) => this.mapToDomain(m));
  }

  async save(partner: Partner): Promise<Partner> {
    const data = (partner as any).toPersistence ? (partner as any).toPersistence() : partner;
    if (partner.id) {
      const updated = await this.prisma.partner.update({ where: { id: partner.id }, data });
      return this.mapToDomain(updated);
    } else {
      const created = await this.prisma.partner.create({ data });
      return this.mapToDomain(created);
    }
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
