import { PartnerProfile, IPartnerProfileRepository } from '@carbroz/common';
import { PrismaProvider } from '../providers/PrismaProvider.js';

export class PrismaPartnerProfileRepository implements IPartnerProfileRepository {
  constructor(private readonly prismaProvider: PrismaProvider) {}

  private get client() {
    return this.prismaProvider.getClient();
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

  async findById(id: number): Promise<PartnerProfile | null> {
    const entity = await this.client.partnerProfile.findUnique({ where: { id } });
    return entity ? this.mapToDomain(entity) : null;
  }

  async findByPartnerId(partnerId: number): Promise<PartnerProfile | null> {
    const entity = await this.client.partnerProfile.findUnique({ where: { partnerId } });
    return entity ? this.mapToDomain(entity) : null;
  }

  async create(profile: Omit<PartnerProfile, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>): Promise<PartnerProfile> {
    const entity = await this.client.partnerProfile.create({
      data: {
        partnerId: profile.partnerId,
        description: profile.description,
        logoUrl: profile.logoUrl,
        supportEmail: profile.supportEmail,
        supportPhone: profile.supportPhone,
      },
    });
    return this.mapToDomain(entity);
  }

  async update(id: number, profile: Partial<PartnerProfile>): Promise<PartnerProfile> {
    const entity = await this.client.partnerProfile.update({
      where: { id },
      data: {
        description: profile.description,
        logoUrl: profile.logoUrl,
        supportEmail: profile.supportEmail,
        supportPhone: profile.supportPhone,
      },
    });
    return this.mapToDomain(entity);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.client.partnerProfile.delete({ where: { id } });
      return true;
    } catch (e: any) {
      if (e.code === 'P2025') return false; // Record not found
      throw e;
    }
  }

  async findAll(): Promise<PartnerProfile[]> {
    const entities = await this.client.partnerProfile.findMany();
    return entities.map(e => this.mapToDomain(e));
  }

  async save(entity: PartnerProfile): Promise<PartnerProfile> {
    return this.update(entity.id, entity);
  }
}
