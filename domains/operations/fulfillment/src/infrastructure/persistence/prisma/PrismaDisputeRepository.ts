import { PrismaProvider } from '@carbroz/platform-database';
import { Money } from '@carbroz/foundation-kernel';
import { Dispute } from '../../../domain/entities/Dispute.js';
import { DisputeStatus } from '../../../domain/enums/DisputeStatus.js';

export class PrismaDisputeRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaProvider: PrismaProvider) {}

  private get prisma() {
    return this.unitOfWorkPrisma || this.prismaProvider.getClient();
  }


  private mapToDomain(record: any): Dispute {
    return new Dispute({
      id: record.id,
      publicId: record.publicId,
      bookingId: record.bookingId,
      raisedByActorId: record.raisedByActorId,
      raisedByActorType: record.raisedByActorType as 'CUSTOMER' | 'PARTNER',
      disputeReason: record.disputeReason,
      description: record.description,
      requestedRefundAmount: Money.fromPaise(record.requestedRefundPaise),
      refundedAmount: Money.fromPaise(record.refundedAmountPaise),
      status: record.status as DisputeStatus,
      resolutionNotes: record.resolutionNotes,
      resolvedAt: record.resolvedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async create(dispute: Dispute): Promise<Dispute> {
    const record = await this.prisma.dispute.create({
      data: {
        bookingId: dispute.bookingId,
        raisedByActorId: dispute.raisedByActorId,
        raisedByActorType: dispute.raisedByActorType,
        disputeReason: dispute.disputeReason,
        description: dispute.description,
        requestedRefundPaise: dispute.requestedRefundAmount.amountPaise,
        refundedAmountPaise: dispute.refundedAmount.amountPaise,
        status: dispute.status,
      },
    });
    return this.mapToDomain(record);
  }

  async update(dispute: Dispute): Promise<Dispute> {
    const record = await this.prisma.dispute.update({
      where: { id: dispute.id },
      data: {
        refundedAmountPaise: dispute.refundedAmount.amountPaise,
        status: dispute.status,
        resolutionNotes: dispute.resolutionNotes,
        resolvedAt: dispute.resolvedAt,
      },
    });
    return this.mapToDomain(record);
  }

  async findById(id: number): Promise<Dispute | null> {
    const record = await this.prisma.dispute.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByPublicId(publicId: string): Promise<Dispute | null> {
    const record = await this.prisma.dispute.findUnique({ where: { publicId } });
    return record ? this.mapToDomain(record) : null;
  }

  async findActiveByBookingId(bookingId: number): Promise<Dispute | null> {
    const record = await this.prisma.dispute.findFirst({
      where: {
        bookingId,
        status: { in: ['OPEN', 'UNDER_REVIEW'] },
      },
    });
    return record ? this.mapToDomain(record) : null;
  }

  async listByBookingId(bookingId: number): Promise<Dispute[]> {
    const records = await this.prisma.dispute.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: any) => this.mapToDomain(r));
  }

  async list(status?: DisputeStatus, limit = 50, offset = 0): Promise<Dispute[]> {
    const records = await this.prisma.dispute.findMany({
      where: status ? { status } : {},
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: any) => this.mapToDomain(r));
  }
}

