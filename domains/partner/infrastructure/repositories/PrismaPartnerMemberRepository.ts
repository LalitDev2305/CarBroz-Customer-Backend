import { PrismaClient } from '@prisma/client';
import { PartnerMember, PartnerMemberRole, PartnerMemberStatus, IPartnerMemberRepository } from '@carbroz/common';

type PartnerMemberRecord = {
  id: number;
  publicId: string;
  userId: number;
  partnerId: number;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export class PrismaPartnerMemberRepository implements IPartnerMemberRepository {
  private unitOfWorkPrisma: PrismaClient | null = null;

  constructor(private readonly prismaClient: PrismaClient) {}

  private get prisma(): PrismaClient {
    return this.unitOfWorkPrisma ?? this.prismaClient;
  }

  public setUnitOfWork(uow: PrismaClient): void {
    this.unitOfWorkPrisma = uow;
  }

  protected mapToDomain(entity: PartnerMemberRecord): PartnerMember {
    return {
      id: entity.id,
      publicId: entity.publicId,
      userId: entity.userId,
      partnerId: entity.partnerId,
      role: entity.role as PartnerMemberRole,
      status: entity.status as PartnerMemberStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  public async findByPublicId(publicId: string): Promise<PartnerMember | null> {
    const entity = await this.prisma.partnerMember.findUnique({ where: { publicId } });
    return entity ? this.mapToDomain(entity) : null;
  }

  public async findByUserIdAndPartnerId(userId: number, partnerId: number): Promise<PartnerMember | null> {
    const entity = await this.prisma.partnerMember.findUnique({
      where: { userId_partnerId: { userId, partnerId } }
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  public async findByUserId(userId: number): Promise<PartnerMember[]> {
    const entities = await this.prisma.partnerMember.findMany({ where: { userId } });
    return entities.map((entity) => this.mapToDomain(entity));
  }

  public async findByPartnerId(partnerId: number): Promise<PartnerMember[]> {
    const entities = await this.prisma.partnerMember.findMany({ where: { partnerId } });
    return entities.map((entity) => this.mapToDomain(entity));
  }

  public async findById(id: number): Promise<PartnerMember | null> {
    const entity = await this.prisma.partnerMember.findUnique({ where: { id } });
    return entity ? this.mapToDomain(entity) : null;
  }

  public async findAll(): Promise<PartnerMember[]> {
    const entities = await this.prisma.partnerMember.findMany();
    return entities.map((entity) => this.mapToDomain(entity));
  }

  public async save(member: PartnerMember): Promise<PartnerMember> {
    if (!member.id) return this.create(member);

    const entity = await this.prisma.partnerMember.update({
      where: { id: member.id },
      data: {
        userId: member.userId,
        partnerId: member.partnerId,
        role: member.role,
        status: member.status,
      }
    });
    return this.mapToDomain(entity);
  }

  public async create(data: Partial<PartnerMember>): Promise<PartnerMember> {
    if (data.userId == null || data.partnerId == null || data.role == null) {
      throw new Error('Partner member userId, partnerId and role are required');
    }

    const entity = await this.prisma.partnerMember.create({
      data: {
        userId: data.userId,
        partnerId: data.partnerId,
        role: data.role,
        status: data.status ?? PartnerMemberStatus.ACTIVE,
        ...(data.publicId ? { publicId: data.publicId } : {}),
      }
    });
    return this.mapToDomain(entity);
  }

  public async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.partnerMember.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
