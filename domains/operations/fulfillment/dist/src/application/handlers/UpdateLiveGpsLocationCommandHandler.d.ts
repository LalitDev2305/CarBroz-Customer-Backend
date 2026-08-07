import { TrackingSession } from '../../domain/entities/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../../infrastructure/persistence/prisma/PrismaTrackingSessionRepository.js';
export interface UpdateGpsInput {
    sessionId: number;
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    etaMinutes?: number;
}
export declare class UpdateLiveGpsLocationCommandHandler {
    private readonly trackingRepository;
    constructor(trackingRepository: PrismaTrackingSessionRepository);
    execute(input: UpdateGpsInput): Promise<TrackingSession>;
}
