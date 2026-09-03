import type { PrismaClient } from '@prisma/client';
import { type Partner } from '../../domain/Partner.js';
import { type PartnerStatus } from '../../domain/PartnerStatus.js';
import { type PartnerType } from '../../domain/PartnerType.js';
import { type IPartnerRepository } from '../../domain/repositories/IPartnerRepository.js';

export class PrismaPartnerRepository implements IPartnerRepository {
  private unitOfWorkPrisma: any = null;
  constructor(private readonly prismaClient: PrismaClient) {}
  private get prisma(): any { return this.unitOfWorkPrisma ?? this.prismaClient; }
  setUnitOfWork(uow: unknown): void { this.unitOfWorkPrisma = uow; }
  private map(entity: any): Partner {
    return { id: entity.id, publicId: entity.publicId, businessName: entity.businessName, type: entity.type as PartnerType, status: entity.status as PartnerStatus, createdAt: entity.createdAt, updatedAt: entity.updatedAt, ...(entity.deletedAt !== undefined ? { deletedAt: entity.deletedAt } : {}) };
  }
  async findById(id: number): Promise<Partner | null> { const entity = await this.prisma.partner.findUnique({ where: { id } }); return entity ? this.map(entity) : null; }
  async findByPublicId(publicId: string): Promise<Partner | null> { const entity = await this.prisma.partner.findUnique({ where: { publicId } }); return entity ? this.map(entity) : null; }
  async findAll(): Promise<Partner[]> { return (await this.prisma.partner.findMany()).map((entity: any) => this.map(entity)); }
  async create(data: Partial<Partner>): Promise<Partner> {
    const entity = await this.prisma.partner.create({ data: { businessName: data.businessName!, type: data.type!, status: data.status! } });
    return this.map(entity);
  }
  async save(partner: Partner): Promise<Partner> {
    const entity = await this.prisma.partner.update({ where: { id: partner.id }, data: { businessName: partner.businessName, type: partner.type, status: partner.status, deletedAt: partner.deletedAt ?? null } });
    return this.map(entity);
  }
  async delete(id: number): Promise<boolean> { await this.prisma.partner.update({ where: { id }, data: { deletedAt: new Date() } }); return true; }
}
