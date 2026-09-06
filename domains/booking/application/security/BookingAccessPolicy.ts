import { DomainError, type ExecutionContext } from '@carbroz/foundation-kernel';
import type { ICustomerProfileRepository } from '@carbroz/domain-customer';
import type { Booking } from '../../domain/Booking.js';
import type { IBookingRepository } from '../../domain/repositories/IBookingRepository.js';

/** Booking-owned structural view of Partner membership needed for authorization. */
export interface IBookingPartnerMembershipLookup {
  findByUserIdAndPartnerId(
    userId: number,
    partnerId: number,
  ): Promise<{ status: string } | null>;
}

/**
 * Canonical resource-ownership policy for externally addressable Booking resources.
 *
 * Authentication proves who the actor is. This policy separately proves that the
 * authenticated User owns the CustomerProfile behind the booking, is an ACTIVE
 * member of the assigned Partner, or has explicit ADMIN authority.
 */
export class BookingAccessPolicy {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly customerProfileRepository: ICustomerProfileRepository,
    private readonly partnerMemberRepository: IBookingPartnerMembershipLookup,
  ) {}

  async requireCustomerBooking(
    bookingPublicId: string,
    userId: number,
  ): Promise<Booking> {
    const booking = await this.requireExistingBooking(bookingPublicId);
    const customer = await this.customerProfileRepository.findByUserId(userId);
    if (!customer?.id || booking.customerId !== customer.id) {
      throw this.notFoundOrUnauthorized();
    }
    return booking;
  }

  async requirePartnerBooking(
    bookingPublicId: string,
    userId: number,
  ): Promise<Booking> {
    const booking = await this.requireExistingBooking(bookingPublicId);
    await this.assertPartnerAccess(booking, userId);
    return booking;
  }

  async requireActorBooking(
    bookingPublicId: string,
    context: ExecutionContext,
  ): Promise<Booking> {
    if (
      context.actor.kind === 'ADMIN' ||
      context.actor.roles.includes('ADMIN')
    ) {
      return this.requireExistingBooking(bookingPublicId);
    }
    if (context.actor.kind === 'CUSTOMER') {
      return this.requireCustomerBooking(bookingPublicId, context.actor.id);
    }
    if (context.actor.kind === 'PARTNER') {
      return this.requirePartnerBooking(bookingPublicId, context.actor.id);
    }
    throw new DomainError('Booking access is forbidden', 'BOOKING_FORBIDDEN');
  }

  async assertPartnerAccess(booking: Booking, userId: number): Promise<void> {
    if (!booking.partnerId) {
      throw this.notFoundOrUnauthorized();
    }
    const membership =
      await this.partnerMemberRepository.findByUserIdAndPartnerId(
        userId,
        booking.partnerId,
      );
    if (!membership || membership.status !== 'ACTIVE') {
      throw this.notFoundOrUnauthorized();
    }
  }

  private async requireExistingBooking(bookingPublicId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findByPublicId(bookingPublicId);
    if (!booking) throw this.notFoundOrUnauthorized();
    return booking;
  }

  private notFoundOrUnauthorized(): DomainError {
    return new DomainError(
      'Booking not found or unauthorized',
      'BOOKING_NOT_FOUND',
    );
  }
}
