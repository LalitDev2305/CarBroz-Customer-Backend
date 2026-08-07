import { Booking, IBookingRepository } from '@carbroz/common';

export interface CancelBookingInput {
  bookingPublicId: string;
  actorId: number;
  reason: string;
  isAdmin?: boolean;
}

export class CancelBookingUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(input: CancelBookingInput): Promise<Booking> {
    if (!input.reason || input.reason.trim().length === 0) {
      throw new Error('Cancellation reason is required');
    }

    const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (!input.isAdmin && booking.customerId !== input.actorId) {
      throw new Error('Unauthorized to cancel this booking');
    }

    booking.cancel(input.actorId, input.reason);
    return await this.bookingRepository.update(booking);
  }
}
