import { PartnerPayout } from '../../../domain/entities/PartnerPayout.js';
export class PrismaPartnerPayoutRepository {
    prismaProvider;
    unitOfWorkPrisma = null;
    constructor(prismaProvider) {
        this.prismaProvider = prismaProvider;
    }
    get prisma() {
        return this.unitOfWorkPrisma || this.prismaProvider.getClient();
    }
    mapToDomain(record) {
        return new PartnerPayout({
            id: record.id,
            publicId: record.publicId,
            bookingId: record.bookingId,
            partnerId: record.partnerId,
            status: record.status,
            grossAmountPaise: record.grossAmountPaise,
            commissionPaise: record.commissionPaise,
            tdsPaise: record.tdsPaise,
            netPayoutPaise: record.netPayoutPaise,
            calculationJson: record.calculationJson,
            scheduledAt: record.scheduledAt,
            paidAt: record.paidAt,
            externalReference: record.externalReference,
            failureReason: record.failureReason,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
    async create(payout) {
        const record = await this.prisma.partnerPayout.create({
            data: {
                bookingId: payout.bookingId,
                partnerId: payout.partnerId,
                status: payout.status,
                grossAmountPaise: payout.grossAmountPaise,
                commissionPaise: payout.commissionPaise,
                tdsPaise: payout.tdsPaise,
                netPayoutPaise: payout.netPayoutPaise,
                calculationJson: payout.calculationJson,
                scheduledAt: payout.scheduledAt,
                paidAt: payout.paidAt,
                externalReference: payout.externalReference,
                failureReason: payout.failureReason,
            },
        });
        return this.mapToDomain(record);
    }
    async findById(id) {
        const record = await this.prisma.partnerPayout.findUnique({ where: { id } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByPublicId(publicId) {
        const record = await this.prisma.partnerPayout.findUnique({ where: { publicId } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByBookingId(bookingId) {
        const record = await this.prisma.partnerPayout.findUnique({ where: { bookingId } });
        return record ? this.mapToDomain(record) : null;
    }
    async listByPartnerId(partnerId, status) {
        const records = await this.prisma.partnerPayout.findMany({
            where: {
                partnerId,
                status: status ? status : undefined,
            },
            orderBy: { scheduledAt: 'desc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
    async listByStatus(status, limit = 50, offset = 0) {
        const records = await this.prisma.partnerPayout.findMany({
            where: { status },
            take: limit,
            skip: offset,
            orderBy: { scheduledAt: 'asc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
    async update(payout) {
        const record = await this.prisma.partnerPayout.update({
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
//# sourceMappingURL=PrismaPartnerPayoutRepository.js.map