import { PrismaClient } from '@prisma/client';
import { type IPartnerPayoutRepository } from '../../domain/repositories/IPartnerPayoutRepository.js';
import { PartnerPayout } from '../../domain/PartnerPayout.js';
import { type PayoutStatus } from '../../domain/PayoutStatus.js';

export class PrismaPartnerPayoutRepository implements IPartnerPayoutRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaClient: PrismaClient) {}

  private get prisma() {
    return this.unitOfWorkPrisma || this.prismaClient;
  }

  private mapToDomain(record: any): PartnerPayout {
    return new PartnerPayout({
      id: record.id,
      publicId: record.publicId,
      bookingId: record.bookingId,
      partnerId: record.partnerId,
      status: record.status as PayoutStatus,
      grossAmountPaise: record.grossAmountPaise,
      commissionPaise: record.commissionPaise,
      tdsPaise: record.tdsPaise,
      netPayoutPaise: record.netPayoutPaise,
      calculationJson: record.calculationJson as any,
      scheduledAt: record.scheduledAt,
      paidAt: record.paidAt,
      externalReference: record.externalReference,
      failureReason: record.failureReason,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async create(payout: PartnerPayout): Promise<PartnerPayout> {
    const record = await (this.prisma as any).partnerPayout.create({
      data: {
        bookingId: payout.bookingId,
        partnerId: payout.partnerId,
        status: payout.status,
        grossAmountPaise: payout.grossAmountPaise,
        commissionPaise: payout.commissionPaise,
        tdsPaise: payout.tdsPaise,
        netPayoutPaise: payout.netPayoutPaise,
        calculationJson: payout.calculationJson as any,
        scheduledAt: payout.scheduledAt,
        paidAt: payout.paidAt,
        externalReference: payout.externalReference,
        failureReason: payout.failureReason,
      },
    });
    return this.mapToDomain(record);
  }

  async findById(id: number): Promise<PartnerPayout | null> {
    const record = await (this.prisma as any).partnerPayout.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByPublicId(publicId: string): Promise<PartnerPayout | null> {
    const record = await (this.prisma as any).partnerPayout.findUnique({ where: { publicId } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByBookingId(bookingId: number): Promise<PartnerPayout | null> {
    const record = await (this.prisma as any).partnerPayout.findUnique({ where: { bookingId } });
    return record ? this.mapToDomain(record) : null;
  }

  async listByPartnerId(partnerId: number, status?: PayoutStatus): Promise<PartnerPayout[]> {
    const records = await (this.prisma as any).partnerPayout.findMany({
      where: {
        partnerId,
        status: status ? status : undefined,
      },
      orderBy: { scheduledAt: 'desc' },
    });
    return records.map((r: any) => this.mapToDomain(r));
  }

  async listByStatus(status: PayoutStatus, limit = 50, offset = 0): Promise<PartnerPayout[]> {
    const records = await (this.prisma as any).partnerPayout.findMany({
      where: { status },
      take: limit,
      skip: offset,
      orderBy: { scheduledAt: 'asc' },
    });
    return records.map((r: any) => this.mapToDomain(r));
  }

  async update(payout: PartnerPayout): Promise<PartnerPayout> {
    const record = await (this.prisma as any).partnerPayout.update({
      where: { id: payout.id },
      data: {
        status: payout.status,
        paidAt: payout.paidAt,
        externalReference: payout.externalReference,
        failureReason: payout.failureReason,
      },
    });
    return this.mapToDomain(record);
  }
}
