import { LocationPing } from '../domain/LocationPing.js';
export class UpdateLiveGpsLocationUseCase {
    trackingRepository;
    constructor(trackingRepository) {
        this.trackingRepository = trackingRepository;
    }
    async execute(input) {
        const session = await this.trackingRepository.findById(input.sessionId);
        if (!session) {
            throw new Error(`Tracking Session with ID ${input.sessionId} not found`);
        }
        const ping = new LocationPing({
            latitude: input.latitude,
            longitude: input.longitude,
            heading: input.heading,
            speed: input.speed,
        });
        session.updateLocation(ping, input.etaMinutes);
        return this.trackingRepository.update(session);
    }
}
//# sourceMappingURL=UpdateLiveGpsLocationUseCase.js.map