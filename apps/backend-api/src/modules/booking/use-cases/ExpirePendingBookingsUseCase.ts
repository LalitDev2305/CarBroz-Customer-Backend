import { type IBookingRepository } from '@carbroz/domain-booking';

export class ExpirePendingBookingsUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(): Promise<number> {
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
