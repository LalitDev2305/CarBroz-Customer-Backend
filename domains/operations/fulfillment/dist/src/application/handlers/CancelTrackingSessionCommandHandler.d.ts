import { TrackingSession } from '../../domain/entities/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../../infrastructure/persistence/prisma/PrismaTrackingSessionRepository.js';
export declare class CancelTrackingSessionCommandHandler {
    private readonly trackingRepository;
    constructor(trackingRepository: PrismaTrackingSessionRepository);
    execute(sessionId: number): Promise<TrackingSession>;
}
