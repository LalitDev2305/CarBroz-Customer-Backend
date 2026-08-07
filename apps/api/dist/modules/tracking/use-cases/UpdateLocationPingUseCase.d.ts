import { IBookingRepository, IMapsProvider, ITrackingSessionRepository, TrackingSession } from '@carbroz/foundation-kernel';
export interface UpdateLocationPingInput {
    bookingPublicId: string;
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
}
export declare class UpdateLocationPingUseCase {
    private readonly trackingSessionRepository;
    private readonly bookingRepository;
    private readonly mapsProvider;
    constructor(trackingSessionRepository: ITrackingSessionRepository, bookingRepository: IBookingRepository, mapsProvider: IMapsProvider);
    execute(input: UpdateLocationPingInput): Promise<TrackingSession>;
}
