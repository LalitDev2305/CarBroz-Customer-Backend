export class GetLiveTrackingTimelineUseCase {
    trackingRepository;
    constructor(trackingRepository) {
        this.trackingRepository = trackingRepository;
    }
    async execute(bookingId) {
        return this.trackingRepository.findByBookingId(bookingId);
    }
}
//# sourceMappingURL=GetLiveTrackingTimelineUseCase.js.map