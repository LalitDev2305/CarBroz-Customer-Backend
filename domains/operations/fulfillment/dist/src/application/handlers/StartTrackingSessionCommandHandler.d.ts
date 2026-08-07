import { TrackingSession } from '../../domain/entities/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../../infrastructure/persistence/prisma/PrismaTrackingSessionRepository.js';
export interface StartTrackingInput {
    bookingId: number;
    partnerId: number;
    customerId: number;
    initialLatitude: number;
    initialLongitude: number;
}
export declare class StartTrackingSessionCommandHandler {
    private readonly trackingRepository;
    constructor(trackingRepository: PrismaTrackingSessionRepository);
    execute(input: StartTrackingInput): Promise<TrackingSession>;
}
