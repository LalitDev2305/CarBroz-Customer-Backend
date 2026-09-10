import { describe, expect, it, vi } from 'vitest';
import { Booking } from '../domain/Booking.js';
import { BookingAccessPolicy } from '../application/security/BookingAccessPolicy.js';
import { CancelBookingUseCase, ConfirmBookingUseCase, ExpirePendingBookingsUseCase, TransitionBookingStatusUseCase } from '../application/BookingUseCases.js';

const snapshots = {
  service: { serviceId: 1, name: 'Wash', basePricePaise: 100, estimatedDurationMinutes: 30 },
  addons: [],
  pricing: { basePricePaise: 100, addonsTotalPaise: 0, vehicleMultiplier: 1, subtotalPaise: 100, taxesPaise: 18, totalPricePaise: 118 },
  address: { addressLine1: 'A', addressLine2: null, city: 'Pune', state: 'MH', postalCode: '411001', country: 'IN', latitude: null, longitude: null },
  vehicle: { make: 'Tata', model: 'Nexon', variant: null, year: 2025, registrationNumber: 'MH12AB1234', fuelType: 'PETROL' },
} as any;
const booking = (overrides: Record<string, unknown> = {}) => new Booking({
  id: 1, publicId: 'booking-1', customerId: 10, partnerId: 20, vehicleId: 2, addressId: 3, serviceId: 1,
  status: 'CONFIRMED', slotStartTime: new Date('2999-01-01T10:00:00Z'), slotEndTime: new Date('2999-01-01T11:00:00Z'), totalPricePaise: 118, snapshots,
  ...overrides,
} as any);
const ctx = (kind: string, id = 5, roles: string[] = [kind]) => ({ actor: { kind, id, roles }, correlationId: 'c', timestamp: new Date() }) as any;

describe('Booking final application closeout', () => {
  it('covers BookingAccessPolicy existing/customer/partner/admin/forbidden branches', async () => {
    const bookings = { findByPublicId: vi.fn() } as any;
    const customers = { findByUserId: vi.fn() } as any;
    const members = { findByUserIdAndPartnerId: vi.fn() } as any;
    const policy = new BookingAccessPolicy(bookings, customers, members);

    bookings.findByPublicId.mockResolvedValueOnce(null);
    await expect(policy.requireCustomerBooking('x', 1)).rejects.toThrow('not found or unauthorized');
    bookings.findByPublicId.mockResolvedValue(booking()); customers.findByUserId.mockResolvedValueOnce(null);
    await expect(policy.requireCustomerBooking('booking-1', 1)).rejects.toThrow();
    customers.findByUserId.mockResolvedValueOnce({ id: 99 });
    await expect(policy.requireCustomerBooking('booking-1', 1)).rejects.toThrow();
    customers.findByUserId.mockResolvedValueOnce({ id: 10 });
    await expect(policy.requireCustomerBooking('booking-1', 1)).resolves.toMatchObject({ id: 1 });

    bookings.findByPublicId.mockResolvedValueOnce(booking({ partnerId: null }));
    await expect(policy.requirePartnerBooking('booking-1', 7)).rejects.toThrow();
    members.findByUserIdAndPartnerId.mockResolvedValueOnce(null);
    await expect(policy.requirePartnerBooking('booking-1', 7)).rejects.toThrow();
    members.findByUserIdAndPartnerId.mockResolvedValueOnce({ status: 'SUSPENDED' });
    await expect(policy.requirePartnerBooking('booking-1', 7)).rejects.toThrow();
    members.findByUserIdAndPartnerId.mockResolvedValueOnce({ status: 'ACTIVE' });
    await expect(policy.requirePartnerBooking('booking-1', 7)).resolves.toMatchObject({ id: 1 });

    await expect(policy.requireActorBooking('booking-1', ctx('ADMIN', 1))).resolves.toMatchObject({ id: 1 });
    await expect(policy.requireActorBooking('booking-1', ctx('CUSTOMER', 1))).rejects.toThrow();
    members.findByUserIdAndPartnerId.mockResolvedValueOnce({ status: 'ACTIVE' });
    await expect(policy.requireActorBooking('booking-1', ctx('PARTNER', 7))).resolves.toMatchObject({ id: 1 });
    await expect(policy.requireActorBooking('booking-1', ctx('SYSTEM', 1))).rejects.toThrow('forbidden');
    await expect(policy.requireActorBooking('booking-1', ctx('GUEST', 1, ['ADMIN']))).resolves.toMatchObject({ id: 1 });
  });

  it('covers confirm customer resolution and booking ownership branches', async () => {
    const repo = { findByPublicId: vi.fn(), update: vi.fn(async (b: unknown) => b) } as any;
    const customerRepo = { findByUserId: vi.fn() } as any;
    const useCase = new ConfirmBookingUseCase(repo, customerRepo);
    await expect(useCase.execute('booking-1', ctx('PARTNER'))).rejects.toThrow('Customer authority');
    customerRepo.findByUserId.mockResolvedValueOnce(null);
    await expect(useCase.execute('booking-1', ctx('CUSTOMER', 5))).rejects.toThrow('Customer profile not found');
    customerRepo.findByUserId.mockResolvedValue({ id: 10 }); repo.findByPublicId.mockResolvedValueOnce(null);
    await expect(useCase.execute('booking-1', ctx('CUSTOMER', 5))).rejects.toThrow('not found or unauthorized');
    repo.findByPublicId.mockResolvedValueOnce(booking({ customerId: 11, status: 'CREATED' }));
    await expect(useCase.execute('booking-1', ctx('CUSTOMER', 5))).rejects.toThrow();
    repo.findByPublicId.mockResolvedValueOnce(booking({ status: 'CREATED' }));
    await expect(useCase.execute('booking-1', ctx('CUSTOMER', 5))).resolves.toMatchObject({ status: 'CONFIRMED' });
    repo.findByPublicId.mockResolvedValueOnce(booking({ status: 'CREATED' }));
    await expect(useCase.execute('booking-1', { ...ctx('CUSTOMER', 5), actor: { ...ctx('CUSTOMER', 5).actor, customerId: 10 } } as any)).resolves.toMatchObject({ status: 'CONFIRMED' });
  });

  it('covers transition missing/non-partner/access, unsupported, in-progress/completed and payout branches', async () => {
    const repo = { findByPublicId: vi.fn(), update: vi.fn(async (b: unknown) => b) } as any;
    const access = { assertPartnerAccess: vi.fn() } as any;
    const payout = { execute: vi.fn() } as any;
    const useCase = new TransitionBookingStatusUseCase(repo, access, payout);
    repo.findByPublicId.mockResolvedValueOnce(null);
    await expect(useCase.execute({ bookingPublicId: 'x', targetStatus: 'IN_PROGRESS' }, ctx('ADMIN'))).rejects.toThrow('Booking not found');
    repo.findByPublicId.mockResolvedValueOnce(booking({ status: 'ASSIGNED' }));
    await expect(useCase.execute({ bookingPublicId: 'booking-1', targetStatus: 'IN_PROGRESS' }, ctx('CUSTOMER'))).rejects.toThrow('partner authority');
    repo.findByPublicId.mockResolvedValueOnce(booking({ status: 'ASSIGNED' })); access.assertPartnerAccess.mockResolvedValueOnce(undefined);
    await expect(useCase.execute({ bookingPublicId: 'booking-1', targetStatus: 'IN_PROGRESS' }, ctx('PARTNER', 7))).resolves.toMatchObject({ status: 'IN_PROGRESS' });
    expect(access.assertPartnerAccess).toHaveBeenCalled();
    repo.findByPublicId.mockResolvedValueOnce(booking({ status: 'CONFIRMED' }));
    await expect(useCase.execute({ bookingPublicId: 'booking-1', targetStatus: 'CANCELLED' as any }, ctx('ADMIN'))).rejects.toThrow('Unsupported direct transition');
    repo.findByPublicId.mockResolvedValueOnce(booking({ status: 'IN_PROGRESS' }));
    await expect(useCase.execute({ bookingPublicId: 'booking-1', targetStatus: 'COMPLETED' }, ctx('ADMIN'))).resolves.toMatchObject({ status: 'COMPLETED' });
    expect(payout.execute).toHaveBeenCalledWith(1);
    const noPayout = new TransitionBookingStatusUseCase(repo, access);
    repo.findByPublicId.mockResolvedValueOnce(booking({ status: 'IN_PROGRESS' }));
    await expect(noPayout.execute({ bookingPublicId: 'booking-1', targetStatus: 'COMPLETED' }, ctx('ADMIN'))).resolves.toMatchObject({ status: 'COMPLETED' });
  });

  it('covers cancellation reason/missing/ownership/admin and successful customer branches', async () => {
    const repo = { findByPublicId: vi.fn(), update: vi.fn(async (b: unknown) => b) } as any;
    const customers = { findByUserId: vi.fn().mockResolvedValue({ id: 10 }) } as any;
    const useCase = new CancelBookingUseCase(repo, customers);
    await expect(useCase.execute({ bookingPublicId: 'x', reason: ' ' }, ctx('CUSTOMER'))).rejects.toThrow('reason is required');
    repo.findByPublicId.mockResolvedValueOnce(null);
    await expect(useCase.execute({ bookingPublicId: 'x', reason: 'Changed' }, ctx('ADMIN'))).rejects.toThrow('Booking not found');
    repo.findByPublicId.mockResolvedValueOnce(booking({ customerId: 99 }));
    await expect(useCase.execute({ bookingPublicId: 'booking-1', reason: 'Changed' }, ctx('CUSTOMER'))).rejects.toThrow('Unauthorized');
    repo.findByPublicId.mockResolvedValueOnce(booking());
    await expect(useCase.execute({ bookingPublicId: 'booking-1', reason: 'Changed' }, ctx('CUSTOMER'))).resolves.toMatchObject({ status: 'CANCELLED', cancellationReason: 'Changed' });
    repo.findByPublicId.mockResolvedValueOnce(booking());
    await expect(useCase.execute({ bookingPublicId: 'booking-1', reason: 'Admin' }, ctx('ADMIN'))).resolves.toMatchObject({ status: 'CANCELLED' });
  });

  it('covers expiration authority and empty/non-empty transaction paths', async () => {
    const repo = { findExpiredPendingBookings: vi.fn(), update: vi.fn() } as any;
    const tx = { runInTransaction: vi.fn(async (work: (t: unknown) => unknown) => work({ id: 'tx' })) } as any;
    const useCase = new ExpirePendingBookingsUseCase(repo, tx);
    await expect(useCase.execute(ctx('CUSTOMER'))).rejects.toThrow('System authority');
    repo.findExpiredPendingBookings.mockResolvedValueOnce([]);
    await expect(useCase.execute(ctx('SYSTEM'))).resolves.toBe(0);
    repo.findExpiredPendingBookings.mockResolvedValueOnce([booking({ status: 'CREATED' }), booking({ id: 2, status: 'CREATED' })]);
    await expect(useCase.execute(ctx('ADMIN'))).resolves.toBe(2);
    expect(repo.update).toHaveBeenCalledTimes(2);
  });
});
