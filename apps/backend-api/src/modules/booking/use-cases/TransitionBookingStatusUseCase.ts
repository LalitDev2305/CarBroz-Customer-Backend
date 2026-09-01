import { Booking, type BookingStatus, type IBookingRepository } from '@carbroz/domain-booking';
import { CreatePayoutEligibilityUseCase } from '../../payout/use-cases/CreatePayoutEligibilityUseCase.js';

export interface TransitionBookingStatusInput {
  bookingPublicId: string;
  targetStatus: BookingStatus;
  actorId: number;
}

export class TransitionBookingStatusUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly createPayoutEligibilityUseCase?: CreatePayoutEligibilityUseCase
  ) {}

  async execute(input: TransitionBookingStatusInput): Promise<Booking> {
    const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (input.targetStatus === 'IN_PROGRESS') {
      booking.startService(input.actorId);
    } else if (input.targetStatus === 'COMPLETED') {
      booking.completeService(input.actorId);
    } else {
      throw new Error(`Unsupported direct transition to ${input.targetStatus}`);
    }

    const updated = await this.bookingRepository.update(booking);

    if (input.targetStatus === 'COMPLETED' && this.createPayoutEligibilityUseCase) {
      await this.createPayoutEligibilityUseCase.execute(booking.id!);
    }

    return updated;
  }
}
