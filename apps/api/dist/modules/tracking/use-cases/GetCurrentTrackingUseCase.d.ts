import { IBookingRepository, ITrackingSessionRepository, TrackingSession } from '@carbroz/foundation-kernel';
export declare class GetCurrentTrackingUseCase {
    private readonly bookingRepository;
    private readonly trackingSessionRepository;
    constructor(bookingRepository: IBookingRepository, trackingSessionRepository: ITrackingSessionRepository);
    execute(bookingPublicId: string): Promise<TrackingSession | null>;
}
