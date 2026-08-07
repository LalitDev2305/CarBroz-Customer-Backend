import { IBookingRepository, ITrackingSessionRepository, TrackingSession } from '@carbroz/foundation-kernel';
export interface StartTrackingSessionInput {
    bookingPublicId: string;
    partnerUserId: number;
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
}
export declare class StartTrackingSessionUseCase {
    private readonly bookingRepository;
    private readonly trackingSessionRepository;
    constructor(bookingRepository: IBookingRepository, trackingSessionRepository: ITrackingSessionRepository);
    execute(input: StartTrackingSessionInput): Promise<TrackingSession>;
}
