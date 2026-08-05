import { PrismaClient } from '@prisma/client';
import { ITrackingSessionRepository, TrackingSession } from '@carbroz/common';
export declare class PrismaTrackingSessionRepository implements ITrackingSessionRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private mapToDomain;
    create(session: TrackingSession): Promise<TrackingSession>;
    findById(id: number): Promise<TrackingSession | null>;
    findByPublicId(publicId: string): Promise<TrackingSession | null>;
    findByBookingId(bookingId: number): Promise<TrackingSession | null>;
    findActiveByPartnerId(partnerId: number): Promise<TrackingSession | null>;
    update(session: TrackingSession): Promise<TrackingSession>;
}
//# sourceMappingURL=PrismaTrackingSessionRepository.d.ts.map