import { Money } from '@carbroz/foundation-kernel';
import { Dispute } from '../../domain/Dispute.js';
export class PrismaDisputeRepository {
    prismaProvider;
    unitOfWorkPrisma = null;
    constructor(prismaProvider) {
        this.prismaProvider = prismaProvider;
    }
    get prisma() {
        return this.unitOfWorkPrisma || this.prismaProvider.getClient();
    }
    mapToDomain(record) {
        return new Dispute({
            id: record.id,
            publicId: record.publicId,
            bookingId: record.bookingId,
            raisedByActorId: record.raisedByActorId,
            raisedByActorType: record.raisedByActorType,
            disputeReason: record.disputeReason,
            description: record.description,
            requestedRefundAmount: Money.fromPaise(record.requestedRefundPaise),
            refundedAmount: Money.fromPaise(record.refundedAmountPaise),
            status: record.status,
            resolutionNotes: record.resolutionNotes,
            resolvedAt: record.resolvedAt,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
    async create(dispute) {
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
    async update(dispute) {
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
    async findById(id) {
        const record = await this.prisma.dispute.findUnique({ where: { id } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByPublicId(publicId) {
        const record = await this.prisma.dispute.findUnique({ where: { publicId } });
        return record ? this.mapToDomain(record) : null;
    }
    async findActiveByBookingId(bookingId) {
        const record = await this.prisma.dispute.findFirst({
            where: {
                bookingId,
                status: { in: ['OPEN', 'UNDER_REVIEW'] },
            },
        });
        return record ? this.mapToDomain(record) : null;
    }
    async listByBookingId(bookingId) {
        const records = await this.prisma.dispute.findMany({
            where: { bookingId },
            orderBy: { createdAt: 'desc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
    async list(status, limit = 50, offset = 0) {
        const records = await this.prisma.dispute.findMany({
            where: status ? { status } : {},
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
}
//# sourceMappingURL=PrismaDisputeRepository.js.map