export class CompleteTrackingSessionCommandHandler {
    trackingRepository;
    constructor(trackingRepository) {
        this.trackingRepository = trackingRepository;
    }
    async execute(sessionId) {
        const session = await this.trackingRepository.findById(sessionId);
        if (!session) {
            throw new Error(`Tracking Session with ID ${sessionId} not found`);
        }
        session.complete();
        return this.trackingRepository.update(session);
    }
}
//# sourceMappingURL=CompleteTrackingSessionCommandHandler.js.map