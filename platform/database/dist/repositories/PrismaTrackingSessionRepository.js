import { TrackingSession } from '@carbroz/common';
export class PrismaTrackingSessionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToDomain(record) {
        return new TrackingSession({
            id: record.id,
            publicId: record.publicId,
            bookingId: record.bookingId,
            partnerId: record.partnerId,
            customerId: record.customerId,
            currentLatitude: record.currentLatitude,
            currentLongitude: record.currentLongitude,
            heading: record.heading,
            speed: record.speed,
            etaMinutes: record.etaMinutes,
            status: record.status,
            startedAt: record.startedAt,
            endedAt: record.endedAt,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
    async create(session) {
        const record = await this.prisma.trackingSession.create({
            data: {
                bookingId: session.bookingId,
                partnerId: session.partnerId,
                customerId: session.customerId,
                currentLatitude: session.currentLatitude,
                currentLongitude: session.currentLongitude,
                heading: session.heading,
                speed: session.speed,
                etaMinutes: session.etaMinutes,
                status: session.status,
                startedAt: session.startedAt,
                endedAt: session.endedAt,
            },
        });
        return this.mapToDomain(record);
    }
    async findById(id) {
        const record = await this.prisma.trackingSession.findUnique({ where: { id } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByPublicId(publicId) {
        const record = await this.prisma.trackingSession.findUnique({ where: { publicId } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByBookingId(bookingId) {
        const record = await this.prisma.trackingSession.findUnique({ where: { bookingId } });
        return record ? this.mapToDomain(record) : null;
    }
    async findActiveByPartnerId(partnerId) {
        const record = await this.prisma.trackingSession.findFirst({
            where: { partnerId, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });
        return record ? this.mapToDomain(record) : null;
    }
    async update(session) {
        const record = await this.prisma.trackingSession.update({
            where: { id: session.id },
            data: {
                currentLatitude: session.currentLatitude,
                currentLongitude: session.currentLongitude,
                heading: session.heading,
                speed: session.speed,
                etaMinutes: session.etaMinutes,
                status: session.status,
                endedAt: session.endedAt,
            },
        });
        return this.mapToDomain(record);
    }
}
//# sourceMappingURL=PrismaTrackingSessionRepository.js.map