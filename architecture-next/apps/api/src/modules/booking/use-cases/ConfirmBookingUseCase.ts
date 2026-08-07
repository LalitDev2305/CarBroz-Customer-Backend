import { Booking, IBookingRepository } from '@carbroz/common';

export class ConfirmBookingUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(bookingPublicId: string, customerId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findByPublicId(bookingPublicId);
    if (!booking || booking.customerId !== customerId) {
      throw new Error('Booking not found or unauthorized');
    }

    booking.confirm(customerId);
    return await this.bookingRepository.update(booking);
  }
}
