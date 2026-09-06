import { DomainError } from "@carbroz/foundation-kernel";
import type { IBookingRepository } from "@carbroz/domain-booking";
import type { IPartnerRepository } from "@carbroz/domain-partner";
import type { Booking } from "@carbroz/domain-booking";

/** Operations owns dispatch/assignment; Booking owns only booking lifecycle state. */
export class AssignPartnerToBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute(
    bookingPublicId: string,
    partnerId: number,
    adminUserId: number,
  ): Promise<Booking> {
    const booking =
      await this.bookingRepository.findByPublicId(bookingPublicId);
    if (!booking) throw new DomainError("Booking not found");
    const partner = await this.partnerRepository.findById(partnerId);
    if (!partner || partner.status !== "ACTIVE")
      throw new DomainError("Partner not found or not active");
    const conflicting =
      await this.bookingRepository.findConflictingPartnerBooking(
        partnerId,
        booking.slotStartTime,
        booking.slotEndTime,
        booking.id,
      );
    if (conflicting)
      throw new DomainError(
        "Partner has a conflicting booking assignment during this time slot",
      );
    booking.assignPartner(partnerId, adminUserId);
    return this.bookingRepository.update(booking);
  }
}
