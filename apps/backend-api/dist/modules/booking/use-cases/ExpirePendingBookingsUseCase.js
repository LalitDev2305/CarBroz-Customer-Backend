export class ExpirePendingBookingsUseCase {
    bookingRepository;
    constructor(bookingRepository) {
        this.bookingRepository = bookingRepository;
    }
    async execute() {
        const now = new Date();
        const expiredBookings = await this.bookingRepository.findExpiredPendingBookings(now);
        let count = 0;
        for (const booking of expiredBookings) {
            booking.expire('SYSTEM');
            await this.bookingRepository.update(booking);
            count++;
        }
        return count;
    }
}
//# sourceMappingURL=ExpirePendingBookingsUseCase.js.map