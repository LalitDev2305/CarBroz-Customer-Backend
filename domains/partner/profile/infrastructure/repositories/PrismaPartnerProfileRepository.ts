import type { PrismaClient } from '@prisma/client';
import { type PartnerProfile } from '../../domain/PartnerProfile.js';
import { type IPartnerProfileRepository } from '../../domain/repositories/IPartnerProfileRepository.js';

export class PrismaPartnerProfileRepository implements IPartnerProfileRepository {
  constructor(private readonly prismaClient: PrismaClient) {}
  private map(entity: any): PartnerProfile { return { id: entity.id, publicId: entity.publicId, partnerId: entity.partnerId, description: entity.description, logoUrl: entity.logoUrl, supportEmail: entity.supportEmail, supportPhone: entity.supportPhone, createdAt: entity.createdAt, updatedAt: entity.updatedAt }; }
  async findById(id: number): Promise<PartnerProfile | null> { const entity = await this.prismaClient.partnerProfile.findUnique({ where: { id } }); return entity ? this.map(entity) : null; }
  async findByPublicId(publicId: string): Promise<PartnerProfile | null> { const entity = await this.prismaClient.partnerProfile.findUnique({ where: { publicId } }); return entity ? this.map(entity) : null; }
  async findByPartnerId(partnerId: number): Promise<PartnerProfile | null> { const entity = await this.prismaClient.partnerProfile.findUnique({ where: { partnerId } }); return entity ? this.map(entity) : null; }
  async findAll(): Promise<PartnerProfile[]> { return (await this.prismaClient.partnerProfile.findMany()).map((entity: any) => this.map(entity)); }
  async create(profile: Omit<PartnerProfile, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>): Promise<PartnerProfile> { const entity = await this.prismaClient.partnerProfile.create({ data: profile }); return this.map(entity); }
  async update(id: number, profile: Partial<PartnerProfile>): Promise<PartnerProfile> { const entity = await this.prismaClient.partnerProfile.update({ where: { id }, data: profile }); return this.map(entity); }
  async save(profile: PartnerProfile): Promise<PartnerProfile> { return this.update(profile.id, profile); }
  async delete(id: number): Promise<boolean> { await this.prismaClient.partnerProfile.delete({ where: { id } }); return true; }
}
