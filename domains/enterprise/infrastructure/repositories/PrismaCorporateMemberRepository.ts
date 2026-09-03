import { PrismaClient } from '@prisma/client';
import { type ICorporateMemberRepository } from '../../domain/corporate/repositories/ICorporateMemberRepository.js';
import { CorporateMember, type CorporateMemberRole } from '../../domain/corporate/CorporateMember.js';

export class PrismaCorporateMemberRepository implements ICorporateMemberRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(record: any): CorporateMember {
    return new CorporateMember({
      id: record.id,
      publicId: record.publicId,
      corporateAccountId: record.corporateAccountId,
      userId: record.userId,
      role: record.role as CorporateMemberRole,
      status: record.status,
      monthlyCapPaise: record.monthlyCapPaise,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async create(member: CorporateMember): Promise<CorporateMember> {
    const record = await (this.prisma as any).corporateMember.create({
      data: {
        corporateAccountId: member.corporateAccountId,
        userId: member.userId,
        role: member.role,
        status: member.status,
        monthlyCapPaise: member.monthlyCapPaise,
      },
    });
    return this.mapToDomain(record);
  }

  async update(member: CorporateMember): Promise<CorporateMember> {
    const record = await (this.prisma as any).corporateMember.update({
      where: { id: member.id },
      data: {
        role: member.role,
        status: member.status,
        monthlyCapPaise: member.monthlyCapPaise,
      },
    });
    return this.mapToDomain(record);
  }

  async findById(id: number): Promise<CorporateMember | null> {
    const record = await (this.prisma as any).corporateMember.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByPublicId(publicId: string): Promise<CorporateMember | null> {
    const record = await (this.prisma as any).corporateMember.findUnique({ where: { publicId } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByAccountAndUser(corporateAccountId: number, userId: number): Promise<CorporateMember | null> {
    const record = await (this.prisma as any).corporateMember.findUnique({
      where: { corporateAccountId_userId: { corporateAccountId, userId } },
    });
    return record ? this.mapToDomain(record) : null;
  }

  async findByUserId(userId: number): Promise<CorporateMember | null> {
    const record = await (this.prisma as any).corporateMember.findFirst({
      where: { userId, status: 'ACTIVE' },
    });
    return record ? this.mapToDomain(record) : null;
  }

  async listByAccountId(corporateAccountId: number): Promise<CorporateMember[]> {
    const records = await (this.prisma as any).corporateMember.findMany({
      where: { corporateAccountId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: any) => this.mapToDomain(r));
  }

  async delete(id: number): Promise<void> {
    await (this.prisma as any).corporateMember.delete({ where: { id } });
  }
}
