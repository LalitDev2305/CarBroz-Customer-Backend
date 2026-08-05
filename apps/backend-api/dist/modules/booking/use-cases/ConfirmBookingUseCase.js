export class ConfirmBookingUseCase {
    bookingRepository;
    constructor(bookingRepository) {
        this.bookingRepository = bookingRepository;
    }
    async execute(bookingPublicId, customerId) {
        const booking = await this.bookingRepository.findByPublicId(bookingPublicId);
        if (!booking || booking.customerId !== customerId) {
            throw new Error('Booking not found or unauthorized');
        }
        booking.confirm(customerId);
        return await this.bookingRepository.update(booking);
    }
}
//# sourceMappingURL=ConfirmBookingUseCase.js.map