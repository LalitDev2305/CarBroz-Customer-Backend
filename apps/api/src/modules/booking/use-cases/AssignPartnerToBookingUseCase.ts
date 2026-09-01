import { Booking, type IBookingRepository } from '@carbroz/domain-booking';
import { type IPartnerRepository } from '@carbroz/common';

export class AssignPartnerToBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly partnerRepository: IPartnerRepository
  ) {}

  async execute(bookingPublicId: string, partnerId: number, adminUserId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findByPublicId(bookingPublicId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const partner = await this.partnerRepository.findById(partnerId);
    if (!partner || partner.status !== 'ACTIVE') {
      throw new Error('Partner not found or not active');
    }

    const conflicting = await this.bookingRepository.findConflictingPartnerBooking(
      partnerId,
      booking.slotStartTime,
      booking.slotEndTime,
      booking.id
    );
    if (conflicting) {
      throw new Error('Partner has a conflicting booking assignment during this time slot');
    }

    booking.assignPartner(partnerId, adminUserId);
    return await this.bookingRepository.update(booking);
  }
}
