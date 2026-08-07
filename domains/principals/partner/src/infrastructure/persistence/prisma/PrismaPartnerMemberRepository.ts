import { PrismaProvider } from '@carbroz/platform-database';
import { PartnerMember } from '../../../domain/entities/PartnerMember.js';
import { PartnerMemberRole } from '../../../domain/enums/PartnerMemberRole.js';
import { PartnerMemberStatus } from '../../../domain/enums/PartnerMemberStatus.js';

export class PrismaPartnerMemberRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaProvider: PrismaProvider) {}

  private get prisma() {
    return this.unitOfWorkPrisma || this.prismaProvider.getClient();
  }


  public setUnitOfWork(uow: any): void {
    this.unitOfWorkPrisma = uow;
  }

  protected mapToDomain(entity: any): PartnerMember {

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
    const entity = await this.prisma.partnerMember.findUnique({
      where: { publicId }
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  public async findByUserIdAndPartnerId(userId: number, partnerId: number): Promise<PartnerMember | null> {
    const entity = await this.prisma.partnerMember.findUnique({
      where: {
        userId_partnerId: {
          userId,
          partnerId
        }
      }
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  public async findByUserId(userId: number): Promise<PartnerMember[]> {
    const entities = await this.prisma.partnerMember.findMany({
      where: { userId }
    });
    return entities.map((e: any) => this.mapToDomain(e));
  }

  public async findByPartnerId(partnerId: number): Promise<PartnerMember[]> {
    const entities = await this.prisma.partnerMember.findMany({
      where: { partnerId }
    });
    return entities.map((e: any) => this.mapToDomain(e));
  }

  public async findById(id: number): Promise<PartnerMember | null> {
    const entity = await this.prisma.partnerMember.findUnique({
      where: { id }
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  public async findAll(): Promise<PartnerMember[]> {
    const entities = await this.prisma.partnerMember.findMany();
    return entities.map((e: any) => this.mapToDomain(e));
  }


  public async save(entity: PartnerMember): Promise<PartnerMember> {
    throw new Error('Method not implemented.');
  }

  public async create(data: Partial<PartnerMember>): Promise<PartnerMember> {
    const entity = await this.prisma.partnerMember.create({
      data: {
        userId: data.userId!,
        partnerId: data.partnerId!,
        role: data.role!,
        status: data.status!
      }
    });
    return this.mapToDomain(entity);
  }

  public async delete(id: number): Promise<boolean> {
    await this.prisma.partnerMember.delete({
      where: { id }
    });
    return true;
  }
}
