import { LocationPing } from '../../domain/entities/LocationPing.js';
export class SyncOfflineGpsLocationsCommandHandler {
    trackingRepository;
    constructor(trackingRepository) {
        this.trackingRepository = trackingRepository;
    }
    async execute(input) {
        const session = await this.trackingRepository.findById(input.sessionId);
        if (!session) {
            throw new Error(`Tracking Session with ID ${input.sessionId} not found`);
        }
        if (!input.pings || input.pings.length === 0) {
            return session;
        }
        // Process the latest timestamped ping for session status update
        const sortedPings = [...input.pings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const latestPing = sortedPings[sortedPings.length - 1];
        if (!latestPing) {
            return session;
        }
        const ping = new LocationPing({
            latitude: latestPing.latitude,
            longitude: latestPing.longitude,
            heading: latestPing.heading,
            speed: latestPing.speed,
        });
        session.updateLocation(ping);
        return this.trackingRepository.update(session);
    }
}
//# sourceMappingURL=SyncOfflineGpsLocationsCommandHandler.js.map