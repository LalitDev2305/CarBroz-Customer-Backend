import { Booking } from '../../../domain/entities/Booking.js';
export class PrismaBookingRepository {
    prismaProvider;
    unitOfWorkPrisma = null;
    constructor(prismaProvider) {
        this.prismaProvider = prismaProvider;
    }
    get prisma() {
        return this.unitOfWorkPrisma || this.prismaProvider.getClient();
    }
    mapToDomain(record) {
        return new Booking({
            id: record.id,
            publicId: record.publicId,
            customerId: record.customerId,
            partnerId: record.partnerId,
            vehicleId: record.vehicleId,
            addressId: record.addressId,
            serviceId: record.serviceId,
            status: record.status,
            slotStartTime: record.slotStartTime,
            slotEndTime: record.slotEndTime,
            expiryAt: record.expiryAt,
            totalPricePaise: record.totalPricePaise,
            cancellationReason: record.cancellationReason,
            snapshots: record.snapshotsJson,
            statusHistory: record.statusHistoryJson,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
    async create(booking) {
        const record = await this.prisma.booking.create({
            data: {
                customerId: booking.customerId,
                partnerId: booking.partnerId,
                vehicleId: booking.vehicleId,
                addressId: booking.addressId,
                serviceId: booking.serviceId,
                status: booking.status,
                slotStartTime: booking.slotStartTime,
                slotEndTime: booking.slotEndTime,
                expiryAt: booking.expiryAt,
                totalPricePaise: booking.totalPricePaise,
                cancellationReason: booking.cancellationReason,
                snapshotsJson: booking.snapshots,
                statusHistoryJson: booking.statusHistory,
            },
        });
        return this.mapToDomain(record);
    }
    async findById(id) {
        const record = await this.prisma.booking.findUnique({ where: { id } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByPublicId(publicId) {
        const record = await this.prisma.booking.findUnique({ where: { publicId } });
        return record ? this.mapToDomain(record) : null;
    }
    async listByCustomerId(customerId, status) {
        const records = await this.prisma.booking.findMany({
            where: {
                customerId,
                status: status ? status : undefined,
            },
            orderBy: { createdAt: 'desc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
    async listByPartnerId(partnerId, status) {
        const records = await this.prisma.booking.findMany({
            where: {
                partnerId,
                status: status ? status : undefined,
            },
            orderBy: { slotStartTime: 'asc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
    async listAll(status, limit = 50, offset = 0) {
        const records = await this.prisma.booking.findMany({
            where: { status: status ? status : undefined },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
    async findConflictingPartnerBooking(partnerId, startTime, endTime, excludeBookingId) {
        const record = await this.prisma.booking.findFirst({
            where: {
                partnerId,
                id: excludeBookingId ? { not: excludeBookingId } : undefined,
                status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
                OR: [
                    {
                        slotStartTime: { lte: startTime },
                        slotEndTime: { gt: startTime },
                    },
                    {
                        slotStartTime: { lt: endTime },
                        slotEndTime: { gte: endTime },
                    },
                    {
                        slotStartTime: { gte: startTime },
                        slotEndTime: { lte: endTime },
                    },
                ],
            },
        });
        return record ? this.mapToDomain(record) : null;
    }
    async findConflictingSlotBooking(serviceId, startTime, endTime) {
        const record = await this.prisma.booking.findFirst({
            where: {
                serviceId,
                status: { in: ['CREATED', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS'] },
                slotStartTime: startTime,
                slotEndTime: endTime,
            },
        });
        return record ? this.mapToDomain(record) : null;
    }
    async findExpiredPendingBookings(now) {
        const records = await this.prisma.booking.findMany({
            where: {
                status: 'CREATED',
                expiryAt: { lt: now },
            },
        });
        return records.map((r) => this.mapToDomain(r));
    }
    async update(booking) {
        const record = await this.prisma.booking.update({
            where: { id: booking.id },
            data: {
                partnerId: booking.partnerId,
                status: booking.status,
                expiryAt: booking.expiryAt,
                cancellationReason: booking.cancellationReason,
                snapshotsJson: booking.snapshots,
                statusHistoryJson: booking.statusHistory,
            },
        });
        return this.mapToDomain(record);
    }
}
//# sourceMappingURL=PrismaBookingRepository.js.map