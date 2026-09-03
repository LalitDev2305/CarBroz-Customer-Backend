import type { PrismaClient } from '@prisma/client';
import { type PartnerMember } from '../../domain/PartnerMember.js';
import { type PartnerMemberRole } from '../../domain/PartnerMemberRole.js';
import { type PartnerMemberStatus } from '../../domain/PartnerMemberStatus.js';
import { type IPartnerMemberRepository } from '../../domain/repositories/IPartnerMemberRepository.js';

export class PrismaPartnerMemberRepository implements IPartnerMemberRepository {
  private unitOfWorkPrisma: any = null;
  constructor(private readonly prismaClient: PrismaClient) {}
  private get prisma(): any { return this.unitOfWorkPrisma ?? this.prismaClient; }
  setUnitOfWork(uow: unknown): void { this.unitOfWorkPrisma = uow; }
  private map(entity: any): PartnerMember { return { id: entity.id, publicId: entity.publicId, userId: entity.userId, partnerId: entity.partnerId, role: entity.role as PartnerMemberRole, status: entity.status as PartnerMemberStatus, createdAt: entity.createdAt, updatedAt: entity.updatedAt }; }
  async findById(id: number): Promise<PartnerMember | null> { const entity = await this.prisma.partnerMember.findUnique({ where: { id } }); return entity ? this.map(entity) : null; }
  async findByPublicId(publicId: string): Promise<PartnerMember | null> { const entity = await this.prisma.partnerMember.findUnique({ where: { publicId } }); return entity ? this.map(entity) : null; }
  async findByUserIdAndPartnerId(userId: number, partnerId: number): Promise<PartnerMember | null> { const entity = await this.prisma.partnerMember.findUnique({ where: { userId_partnerId: { userId, partnerId } } }); return entity ? this.map(entity) : null; }
  async findByUserId(userId: number): Promise<PartnerMember[]> { return (await this.prisma.partnerMember.findMany({ where: { userId } })).map((entity: any) => this.map(entity)); }
  async findByPartnerId(partnerId: number): Promise<PartnerMember[]> { return (await this.prisma.partnerMember.findMany({ where: { partnerId } })).map((entity: any) => this.map(entity)); }
  async findAll(): Promise<PartnerMember[]> { return (await this.prisma.partnerMember.findMany()).map((entity: any) => this.map(entity)); }
  async create(data: Partial<PartnerMember>): Promise<PartnerMember> { const entity = await this.prisma.partnerMember.create({ data: { userId: data.userId!, partnerId: data.partnerId!, role: data.role!, status: data.status! } }); return this.map(entity); }
  async save(member: PartnerMember): Promise<PartnerMember> { const entity = await this.prisma.partnerMember.update({ where: { id: member.id }, data: { role: member.role, status: member.status } }); return this.map(entity); }
  async delete(id: number): Promise<boolean> { await this.prisma.partnerMember.delete({ where: { id } }); return true; }
}
