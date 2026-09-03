import { PrismaClient } from '@prisma/client';
import { PartnerProfile, IPartnerProfileRepository } from '@carbroz/common';

type PartnerProfileCreateInput = Omit<PartnerProfile, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>;

export class PrismaPartnerProfileRepository implements IPartnerProfileRepository {
  private unitOfWorkPrisma: PrismaClient | null = null;

  constructor(private readonly prismaClient: PrismaClient) {}

  private get prisma(): PrismaClient {
    return this.unitOfWorkPrisma ?? this.prismaClient;
  }

  private mapToDomain(entity: {
    id: number;
    publicId: string;
    partnerId: number;
    description: string | null;
    logoUrl: string | null;
    supportEmail: string | null;
    supportPhone: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): PartnerProfile {
    return {
      id: entity.id,
      publicId: entity.publicId,
      partnerId: entity.partnerId,
      description: entity.description,
      logoUrl: entity.logoUrl,
      supportEmail: entity.supportEmail,
      supportPhone: entity.supportPhone,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  async findById(id: number): Promise<PartnerProfile | null> {
    const model = await this.prisma.partnerProfile.findUnique({ where: { id } });
    return model ? this.mapToDomain(model) : null;
  }

  async findAll(): Promise<PartnerProfile[]> {
    const models = await this.prisma.partnerProfile.findMany();
    return models.map((model) => this.mapToDomain(model));
  }

  async findByPartnerId(partnerId: number): Promise<PartnerProfile | null> {
    const model = await this.prisma.partnerProfile.findUnique({ where: { partnerId } });
    return model ? this.mapToDomain(model) : null;
  }

  async findByPublicId(publicId: string): Promise<PartnerProfile | null> {
    const model = await this.prisma.partnerProfile.findUnique({ where: { publicId } });
    return model ? this.mapToDomain(model) : null;
  }

  async create(profile: PartnerProfileCreateInput): Promise<PartnerProfile> {
    const model = await this.prisma.partnerProfile.create({
      data: {
        partnerId: profile.partnerId,
        description: profile.description,
        logoUrl: profile.logoUrl,
        supportEmail: profile.supportEmail,
        supportPhone: profile.supportPhone,
      },
    });
    return this.mapToDomain(model);
  }

  async save(profile: PartnerProfile): Promise<PartnerProfile> {
    const model = await this.prisma.partnerProfile.upsert({
      where: { partnerId: profile.partnerId },
      create: {
        partnerId: profile.partnerId,
        description: profile.description,
        logoUrl: profile.logoUrl,
        supportEmail: profile.supportEmail,
        supportPhone: profile.supportPhone,
        ...(profile.publicId ? { publicId: profile.publicId } : {}),
      },
      update: {
        description: profile.description,
        logoUrl: profile.logoUrl,
        supportEmail: profile.supportEmail,
        supportPhone: profile.supportPhone,
      },
    });
    return this.mapToDomain(model);
  }

  async update(id: number, data: Partial<PartnerProfile>): Promise<PartnerProfile> {
    const model = await this.prisma.partnerProfile.update({
      where: { id },
      data: {
        description: data.description,
        logoUrl: data.logoUrl,
        supportEmail: data.supportEmail,
        supportPhone: data.supportPhone,
      },
    });
    return this.mapToDomain(model);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.partnerProfile.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  public setUnitOfWork(uow: PrismaClient): void {
    this.unitOfWorkPrisma = uow;
  }
}
