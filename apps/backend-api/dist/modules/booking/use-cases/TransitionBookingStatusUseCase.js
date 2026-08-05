export class TransitionBookingStatusUseCase {
    bookingRepository;
    createPayoutEligibilityUseCase;
    constructor(bookingRepository, createPayoutEligibilityUseCase) {
        this.bookingRepository = bookingRepository;
        this.createPayoutEligibilityUseCase = createPayoutEligibilityUseCase;
    }
    async execute(input) {
        const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
        if (!booking) {
            throw new Error('Booking not found');
        }
        if (input.targetStatus === 'IN_PROGRESS') {
            booking.startService(input.actorId);
        }
        else if (input.targetStatus === 'COMPLETED') {
            booking.completeService(input.actorId);
        }
        else {
            throw new Error(`Unsupported direct transition to ${input.targetStatus}`);
        }
        const updated = await this.bookingRepository.update(booking);
        if (input.targetStatus === 'COMPLETED' && this.createPayoutEligibilityUseCase) {
            await this.createPayoutEligibilityUseCase.execute(booking.id);
        }
        return updated;
    }
}
//# sourceMappingURL=TransitionBookingStatusUseCase.js.map