import { PrismaProvider } from '@carbroz/platform-database';
import { PartnerProfile } from '../../domain/PartnerProfile.js';

export class PrismaPartnerProfileRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaProvider: PrismaProvider) {}

  private get prisma() {
    return this.unitOfWorkPrisma || this.prismaProvider.getClient();
  }


  private mapToDomain(entity: any): PartnerProfile {
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


  async findByPartnerId(partnerId: number): Promise<PartnerProfile | null> {
    const model = await this.prisma.partnerProfile.findUnique({ where: { partnerId } });
    return model ? this.mapToDomain(model) : null;
  }

  async findByPublicId(publicId: string): Promise<PartnerProfile | null> {
    const model = await this.prisma.partnerProfile.findUnique({ where: { publicId } });
    return model ? this.mapToDomain(model) : null;
  }

  async save(profile: PartnerProfile): Promise<PartnerProfile> {
    const data = (profile as any).toPersistence ? (profile as any).toPersistence() : profile;
    const model = await this.prisma.partnerProfile.upsert({
      where: { partnerId: profile.partnerId },
      create: data,
      update: data,
    });
    return this.mapToDomain(model);
  }

  async update(partnerId: number, data: Partial<PartnerProfile>): Promise<PartnerProfile> {
    const model = await this.prisma.partnerProfile.update({
      where: { partnerId },
      data,
    });
    return this.mapToDomain(model);
  }

  async delete(partnerId: number): Promise<boolean> {
    try {
      await this.prisma.partnerProfile.delete({ where: { partnerId } });
      return true;
    } catch {
      return false;
    }
  }

  public setUnitOfWork(uow: any): void {
    this.unitOfWorkPrisma = uow;
  }
}
