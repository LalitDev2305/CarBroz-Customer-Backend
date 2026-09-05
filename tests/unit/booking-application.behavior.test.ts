import { describe, expect, it, vi } from 'vitest';
import {
  CancelBookingUseCase,
  ConfirmBookingUseCase,
  CreateBookingUseCase,
  ExpirePendingBookingsUseCase,
  TransitionBookingStatusUseCase,
} from '@carbroz/domain-booking';

const future = (minutes: number) => new Date(Date.now() + minutes * 60_000);
const past = () => new Date(Date.now() - 60_000);

function input(overrides: Record<string, unknown> = {}) {
  return {
    customerId: 7,
    vehicleId: 2,
    addressId: 3,
    serviceId: 4,
    addonIds: [11, 12, 999],
    slotStartTime: future(60),
    slotEndTime: future(120),
    ...overrides,
  } as any;
}

function vehicle(overrides: Record<string, unknown> = {}) {
  return {
    id: 2,
    customerId: 7,
    make: 'Tata',
    model: 'Nexon',
    variant: 'XZ',
    year: 2025,
    registrationNumber: 'MH01AB1234',
    fuelType: 'PETROL',
    isBookable: vi.fn().mockReturnValue(true),
    ...overrides,
  };
}

function address(overrides: Record<string, unknown> = {}) {
  return {
    id: 3,
    addressLine1: 'A-1',
    addressLine2: 'Floor 2',
    city: 'Pune',
    state: 'MH',
    postalCode: '411001',
    country: 'IN',
    latitude: 18.52,
    longitude: 73.85,
    ...overrides,
  };
}

function service(overrides: Record<string, unknown> = {}) {
  return {
    id: 4,
    name: 'Deep Wash',
    basePrice: 1_000,
    estimatedDurationMinutes: 90,
    isActive: true,
    ...overrides,
  };
}

function bookingRepo(overrides: Record<string, unknown> = {}) {
  return {
    findConflictingSlotBooking: vi.fn().mockResolvedValue(null),
    create: vi.fn(async (value) => value),
    findByPublicId: vi.fn().mockResolvedValue(null),
    update: vi.fn(async (value) => value),
    findExpiredPendingBookings: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

function createDeps(overrides: Record<string, unknown> = {}) {
  return {
    bookingRepository: bookingRepo(),
    vehicleRepository: { findById: vi.fn().mockResolvedValue(vehicle()) },
    addressRepository: { findById: vi.fn().mockResolvedValue(address()) },
    catalogRepository: {
      findServiceById: vi.fn().mockResolvedValue(service()),
      findAddonsByServiceId: vi.fn().mockResolvedValue([
        { id: 11, name: 'Interior', price: 200, isActive: true },
        { id: 12, name: 'Inactive', price: 300, isActive: false },
      ]),
    },
    pricingRepository: {
      findDefaultTierByServiceId: vi.fn().mockResolvedValue({ flatPrice: 1_200 }),
      findVehicleMultiplier: vi.fn().mockResolvedValue({ multiplier: 1.5 }),
    },
    customerRepository: {},
    transactionProvider: { runInTransaction: vi.fn(async (work) => work()) },
    ...overrides,
  } as any;
}

function createUseCase(deps: any) {
  return new CreateBookingUseCase(
    deps.bookingRepository,
    deps.vehicleRepository,
    deps.addressRepository,
    deps.catalogRepository,
    deps.pricingRepository,
    deps.customerRepository,
    deps.transactionProvider,
  );
}

describe('Booking application behavior', () => {
  describe('CreateBookingUseCase', () => {
    it('rejects non-future start and non-increasing end times', async () => {
      const deps = createDeps();
      const uc = createUseCase(deps);
      await expect(uc.execute(input({ slotStartTime: past(), slotEndTime: future(60) }))).rejects.toThrow('Slot start time must be in the future');
      const start = future(60);
      await expect(uc.execute(input({ slotStartTime: start, slotEndTime: new Date(start) }))).rejects.toThrow('Slot end time must be after slot start time');
    });

    it('rejects missing, foreign and non-bookable vehicles', async () => {
      for (const candidate of [null, vehicle({ customerId: 8 }), vehicle({ isBookable: vi.fn().mockReturnValue(false) })]) {
        const deps = createDeps({ vehicleRepository: { findById: vi.fn().mockResolvedValue(candidate) } });
        await expect(createUseCase(deps).execute(input())).rejects.toThrow('Invalid or non-bookable vehicle');
      }
    });

    it('rejects missing address, missing/inactive service and conflicting slot', async () => {
      const missingAddress = createDeps({ addressRepository: { findById: vi.fn().mockResolvedValue(null) } });
      await expect(createUseCase(missingAddress).execute(input())).rejects.toThrow('Address not found');

      for (const candidate of [null, service({ isActive: false })]) {
        const deps = createDeps({ catalogRepository: { findServiceById: vi.fn().mockResolvedValue(candidate), findAddonsByServiceId: vi.fn() } });
        await expect(createUseCase(deps).execute(input())).rejects.toThrow('Service not found or inactive');
      }

      const conflict = createDeps({ bookingRepository: bookingRepo({ findConflictingSlotBooking: vi.fn().mockResolvedValue({ id: 99 }) }) });
      await expect(createUseCase(conflict).execute(input())).rejects.toThrow('Selected service slot is no longer available');
    });

    it('uses default pricing tier, vehicle multiplier and only active requested addons', async () => {
      const deps = createDeps();
      const result: any = await createUseCase(deps).execute(input());
      expect(deps.transactionProvider.runInTransaction).toHaveBeenCalledOnce();
      expect(deps.bookingRepository.create).toHaveBeenCalledWith(result);
      expect(result.status).toBe('CREATED');
      expect(result.totalPricePaise).toBe(2_360);
      expect(result.snapshots).toMatchObject({
        service: { serviceId: 4, name: 'Deep Wash', basePricePaise: 1_200, estimatedDurationMinutes: 90 },
        addons: [{ addonId: 11, name: 'Interior', pricePaise: 200 }],
        pricing: {
          basePricePaise: 1_200,
          addonsTotalPaise: 200,
          vehicleMultiplier: 1.5,
          subtotalPaise: 2_000,
          taxesPaise: 360,
          totalPricePaise: 2_360,
        },
        vehicle: { make: 'Tata', model: 'Nexon', variant: 'XZ', year: 2025, registrationNumber: 'MH01AB1234', fuelType: 'PETROL' },
        address: { addressLine1: 'A-1', addressLine2: 'Floor 2', city: 'Pune', state: 'MH', postalCode: '411001', country: 'IN' },
      });
      expect(result.expiryAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('falls back to service base price, multiplier 1, no addons and rounds tax/pricing', async () => {
      const deps = createDeps({
        pricingRepository: {
          findDefaultTierByServiceId: vi.fn().mockResolvedValue(null),
          findVehicleMultiplier: vi.fn().mockResolvedValue(null),
        },
      });
      const result: any = await createUseCase(deps).execute(input({ addonIds: undefined }));
      expect(deps.catalogRepository.findAddonsByServiceId).not.toHaveBeenCalled();
      expect(result.snapshots.pricing).toMatchObject({ basePricePaise: 1_000, addonsTotalPaise: 0, vehicleMultiplier: 1, subtotalPaise: 1_000, taxesPaise: 180, totalPricePaise: 1_180 });
    });

    it('handles an explicitly empty addon list without catalog addon lookup', async () => {
      const deps = createDeps();
      const result: any = await createUseCase(deps).execute(input({ addonIds: [] }));
      expect(deps.catalogRepository.findAddonsByServiceId).not.toHaveBeenCalled();
      expect(result.snapshots.addons).toEqual([]);
    });
  });

  describe('ConfirmBookingUseCase', () => {
    it('rejects missing/foreign bookings and confirms an owned booking', async () => {
      const repo = bookingRepo();
      const uc = new ConfirmBookingUseCase(repo as any);
      await expect(uc.execute('missing', 7)).rejects.toThrow('Booking not found or unauthorized');
      repo.findByPublicId.mockResolvedValueOnce({ customerId: 8 });
      await expect(uc.execute('foreign', 7)).rejects.toThrow('Booking not found or unauthorized');
      const owned = { customerId: 7, confirm: vi.fn() };
      repo.findByPublicId.mockResolvedValueOnce(owned);
      await expect(uc.execute('owned', 7)).resolves.toBe(owned);
      expect(owned.confirm).toHaveBeenCalledWith(7);
      expect(repo.update).toHaveBeenCalledWith(owned);
    });
  });

  describe('TransitionBookingStatusUseCase', () => {
    it('rejects missing bookings and unsupported direct transitions', async () => {
      const repo = bookingRepo();
      const uc = new TransitionBookingStatusUseCase(repo as any);
      await expect(uc.execute({ bookingPublicId: 'missing', targetStatus: 'IN_PROGRESS', actorId: 7 })).rejects.toThrow('Booking not found');
      repo.findByPublicId.mockResolvedValueOnce({});
      await expect(uc.execute({ bookingPublicId: 'x', targetStatus: 'CANCELLED' as any, actorId: 7 })).rejects.toThrow('Unsupported direct transition');
    });

    it('starts service without payout side effects', async () => {
      const b = { startService: vi.fn(), completeService: vi.fn(), id: 10 };
      const repo = bookingRepo({ findByPublicId: vi.fn().mockResolvedValue(b) });
      const payout = { execute: vi.fn() };
      const result = await new TransitionBookingStatusUseCase(repo as any, payout as any).execute({ bookingPublicId: 'x', targetStatus: 'IN_PROGRESS', actorId: 22 });
      expect(b.startService).toHaveBeenCalledWith(22);
      expect(b.completeService).not.toHaveBeenCalled();
      expect(payout.execute).not.toHaveBeenCalled();
      expect(result).toBe(b);
    });

    it('completes service and creates payout eligibility when configured', async () => {
      const b = { startService: vi.fn(), completeService: vi.fn(), id: 10 };
      const repo = bookingRepo({ findByPublicId: vi.fn().mockResolvedValue(b) });
      const payout = { execute: vi.fn().mockResolvedValue({}) };
      await new TransitionBookingStatusUseCase(repo as any, payout as any).execute({ bookingPublicId: 'x', targetStatus: 'COMPLETED', actorId: 22 });
      expect(b.completeService).toHaveBeenCalledWith(22);
      expect(payout.execute).toHaveBeenCalledWith(10);
    });

    it('completes service without payout call when no payout port is configured', async () => {
      const b = { completeService: vi.fn(), id: 10 };
      const repo = bookingRepo({ findByPublicId: vi.fn().mockResolvedValue(b) });
      await expect(new TransitionBookingStatusUseCase(repo as any).execute({ bookingPublicId: 'x', targetStatus: 'COMPLETED', actorId: 22 })).resolves.toBe(b);
      expect(b.completeService).toHaveBeenCalledWith(22);
    });
  });

  describe('CancelBookingUseCase', () => {
    it('requires a nonblank reason and an existing booking', async () => {
      const repo = bookingRepo();
      const uc = new CancelBookingUseCase(repo as any);
      await expect(uc.execute({ bookingPublicId: 'x', actorId: 7, reason: '   ' })).rejects.toThrow('Cancellation reason is required');
      await expect(uc.execute({ bookingPublicId: 'missing', actorId: 7, reason: 'changed plan' })).rejects.toThrow('Booking not found');
    });

    it('prevents a non-admin from cancelling another customer booking', async () => {
      const repo = bookingRepo({ findByPublicId: vi.fn().mockResolvedValue({ customerId: 8 }) });
      await expect(new CancelBookingUseCase(repo as any).execute({ bookingPublicId: 'x', actorId: 7, reason: 'changed plan', isAdmin: false })).rejects.toThrow('Unauthorized to cancel this booking');
    });

    it('allows the owning customer and an admin to cancel', async () => {
      for (const command of [
        { bookingPublicId: 'x', actorId: 7, reason: 'changed plan' },
        { bookingPublicId: 'x', actorId: 1, reason: 'fraud', isAdmin: true },
      ]) {
        const b = { customerId: 7, cancel: vi.fn() };
        const repo = bookingRepo({ findByPublicId: vi.fn().mockResolvedValue(b) });
        await expect(new CancelBookingUseCase(repo as any).execute(command)).resolves.toBe(b);
        expect(b.cancel).toHaveBeenCalledWith(command.actorId, command.reason);
        expect(repo.update).toHaveBeenCalledWith(b);
      }
    });
  });

  describe('ExpirePendingBookingsUseCase', () => {
    it('returns zero for no expired bookings and expires every returned booking as SYSTEM', async () => {
      const first = { expire: vi.fn() };
      const second = { expire: vi.fn() };
      const repo = bookingRepo({ findExpiredPendingBookings: vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([first, second]) });
      const uc = new ExpirePendingBookingsUseCase(repo as any);
      await expect(uc.execute()).resolves.toBe(0);
      await expect(uc.execute()).resolves.toBe(2);
      expect(repo.findExpiredPendingBookings.mock.calls[0][0]).toBeInstanceOf(Date);
      for (const b of [first, second]) {
        expect(b.expire).toHaveBeenCalledWith('SYSTEM');
        expect(repo.update).toHaveBeenCalledWith(b);
      }
    });
  });
});
