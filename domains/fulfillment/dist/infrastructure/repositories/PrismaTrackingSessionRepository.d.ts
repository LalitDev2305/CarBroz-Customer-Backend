import { PrismaProvider } from '@carbroz/platform-database';
import { TrackingSession } from '../../domain/TrackingSession.js';
export declare class PrismaTrackingSessionRepository {
    private readonly prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    private mapToDomain;
    create(session: TrackingSession): Promise<TrackingSession>;
    findById(id: number): Promise<TrackingSession | null>;
    findByPublicId(publicId: string): Promise<TrackingSession | null>;
    findByBookingId(bookingId: number): Promise<TrackingSession | null>;
    findActiveByPartnerId(partnerId: number): Promise<TrackingSession | null>;
    update(session: TrackingSession): Promise<TrackingSession>;
}
//# sourceMappingURL=PrismaTrackingSessionRepository.d.ts.map