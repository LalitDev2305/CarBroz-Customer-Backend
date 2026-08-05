import { Partner as PrismaPartner } from '@prisma/client';
import { Partner, PartnerStatus, PartnerType, IPartnerRepository } from '@carbroz/common';
import { PrismaProvider } from '../providers/PrismaProvider.js';

export class PrismaPartnerRepository implements IPartnerRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaProvider: PrismaProvider) {}

  private get prisma() {
    return this.unitOfWorkPrisma || this.prismaProvider.getClient();
  }

  public setUnitOfWork(uow: any): void {
    this.unitOfWorkPrisma = uow;
  }

  protected mapToDomain(entity: PrismaPartner): Partner {
    return {
      id: entity.id,
      publicId: entity.publicId,
      businessName: entity.businessName,
      type: entity.type as PartnerType,
      status: entity.status as PartnerStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt
    };
  }

  public async findByPublicId(publicId: string): Promise<Partner | null> {
    const entity = await this.prisma.partner.findUnique({
      where: { publicId }
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  public async findById(id: number): Promise<Partner | null> {
    const entity = await this.prisma.partner.findUnique({
      where: { id }
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  public async findAll(): Promise<Partner[]> {
    const entities = await this.prisma.partner.findMany();
    return entities.map((e: PrismaPartner) => this.mapToDomain(e));
  }

  public async save(entity: Partner): Promise<Partner> {
    throw new Error('Method not implemented.');
  }

  public async create(data: Partial<Partner>): Promise<Partner> {
    const entity = await this.prisma.partner.create({
      data: {
        businessName: data.businessName!,
        type: data.type!,
        status: data.status!
      }
    });
    return this.mapToDomain(entity);
  }

  public async update(id: number, data: Partial<Partner>): Promise<Partner> {
    const entity = await this.prisma.partner.update({
      where: { id },
      data: {
        status: data.status,
        type: data.type,
        businessName: data.businessName
      }
    });
    return this.mapToDomain(entity);
  }

  public async delete(id: number): Promise<boolean> {
    await this.prisma.partner.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return true;
  }
}
