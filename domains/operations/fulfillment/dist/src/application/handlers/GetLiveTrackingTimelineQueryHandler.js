export class GetLiveTrackingTimelineQueryHandler {
    trackingRepository;
    constructor(trackingRepository) {
        this.trackingRepository = trackingRepository;
    }
    async execute(bookingId) {
        return this.trackingRepository.findByBookingId(bookingId);
    }
}
//# sourceMappingURL=GetLiveTrackingTimelineQueryHandler.js.map