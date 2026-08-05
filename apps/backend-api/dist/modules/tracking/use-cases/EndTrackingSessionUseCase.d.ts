import { IBookingRepository, ITrackingSessionRepository, TrackingSession } from '@carbroz/common';
export declare class EndTrackingSessionUseCase {
    private readonly bookingRepository;
    private readonly trackingSessionRepository;
    constructor(bookingRepository: IBookingRepository, trackingSessionRepository: ITrackingSessionRepository);
    execute(bookingPublicId: string): Promise<TrackingSession>;
}
