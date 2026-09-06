import { describe, expect, it, vi } from 'vitest';
import type { ICustomerProfileRepository } from '@carbroz/domain-customer';
import type { Booking } from '../../domain/Booking.js';
import type { IBookingRepository } from '../../domain/repositories/IBookingRepository.js';
import {
  BookingAccessPolicy,
  type IBookingPartnerMembershipLookup,
} from './BookingAccessPolicy.js';

function bookingRepository(booking: Booking): IBookingRepository {
  return {
    findByPublicId: vi.fn().mockResolvedValue(booking),
  } as unknown as IBookingRepository;
}

function customerRepository(customerId: number): ICustomerProfileRepository {
  return {
    findByUserId: vi.fn().mockResolvedValue({ id: customerId }),
  } as unknown as ICustomerProfileRepository;
}

function partnerMembership(
  membership: { status: string } | null,
): IBookingPartnerMembershipLookup {
  return {
    findByUserIdAndPartnerId: vi.fn().mockResolvedValue(membership),
  };
}

function booking(customerId: number, partnerId: number | null = null): Booking {
  return { customerId, partnerId } as Booking;
}

describe('BookingAccessPolicy', () => {
  it('rejects numeric User.id collisions that do not own the CustomerProfile', async () => {
    const policy = new BookingAccessPolicy(
      bookingRepository(booking(10)),
      customerRepository(99),
      partnerMembership(null),
    );

    await expect(policy.requireCustomerBooking('booking-public-id', 10))
      .rejects.toThrow('Booking not found or unauthorized');
  });

  it('authorizes the User mapped to the owning CustomerProfile', async () => {
    const ownedBooking = booking(99);
    const policy = new BookingAccessPolicy(
      bookingRepository(ownedBooking),
      customerRepository(99),
      partnerMembership(null),
    );

    await expect(policy.requireCustomerBooking('booking-public-id', 10))
      .resolves.toBe(ownedBooking);
  });

  it('rejects numeric User.id collisions with Partner.id when membership is absent', async () => {
    const policy = new BookingAccessPolicy(
      bookingRepository(booking(99, 20)),
      customerRepository(99),
      partnerMembership(null),
    );

    await expect(policy.requirePartnerBooking('booking-public-id', 20))
      .rejects.toThrow('Booking not found or unauthorized');
  });

  it('authorizes an ACTIVE member of the assigned Partner', async () => {
    const assignedBooking = booking(99, 20);
    const membership = partnerMembership({ status: 'ACTIVE' });
    const policy = new BookingAccessPolicy(
      bookingRepository(assignedBooking),
      customerRepository(99),
      membership,
    );

    await expect(policy.requirePartnerBooking('booking-public-id', 7))
      .resolves.toBe(assignedBooking);
    expect(membership.findByUserIdAndPartnerId).toHaveBeenCalledWith(7, 20);
  });
});
