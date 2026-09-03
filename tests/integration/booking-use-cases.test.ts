import { describe, expect, it, beforeEach } from 'vitest';
import { CreateBookingUseCase } from '../../apps/api/src/modules/booking/use-cases/CreateBookingUseCase.js';
import { ConfirmBookingUseCase } from '../../apps/api/src/modules/booking/use-cases/ConfirmBookingUseCase.js';
import { AssignPartnerToBookingUseCase } from '../../apps/api/src/modules/booking/use-cases/AssignPartnerToBookingUseCase.js';
import { CancelBookingUseCase } from '../../apps/api/src/modules/booking/use-cases/CancelBookingUseCase.js';
import { ExpirePendingBookingsUseCase } from '../../apps/api/src/modules/booking/use-cases/ExpirePendingBookingsUseCase.js';
import { Booking, type BookingStatus, type IBookingRepository } from '@carbroz/domain-booking';
import { Vehicle, type IAddressRepository, type ICustomerProfileRepository, type IVehicleRepository } from '@carbroz/domain-customer';
import { type ICatalogRepository, type IPricingRepository } from '@carbroz/domain-catalog-pricing';
import { type IPartnerRepository } from '@carbroz/domain-partner';
import { type ITransactionProvider } from '@carbroz/foundation-kernel';

class MemoryBookingRepository implements IBookingRepository {
  public items: Booking[] = [];
  private nextId = 1;

  async create(booking: Booking): Promise<Booking> {
    booking.id = this.nextId++;
    booking.publicId = `bk_${booking.id}`;
    this.items.push(booking);
    return booking;
  }

  async findById(id: number): Promise<Booking | null> {
    return this.items.find((b) => b.id === id) ?? null;
  }

  async findByPublicId(publicId: string): Promise<Booking | null> {
    return this.items.find((b) => b.publicId === publicId) ?? null;
  }

  async listByCustomerId(customerId: number, status?: BookingStatus): Promise<Booking[]> {
    return this.items.filter((b) => b.customerId === customerId && (!status || b.status === status));
  }

  async listByPartnerId(partnerId: number, status?: BookingStatus): Promise<Booking[]> {
    return this.items.filter((b) => b.partnerId === partnerId && (!status || b.status === status));
  }

  async listAll(status?: BookingStatus, limit = 50, offset = 0): Promise<Booking[]> {
    return this.items.filter((b) => !status || b.status === status).slice(offset, offset + limit);
  }

  async findConflictingPartnerBooking(partnerId: number, startTime: Date, endTime: Date, excludeBookingId?: number): Promise<Booking | null> {
    return this.items.find(
      (b) =>
        b.partnerId === partnerId &&
        b.id !== excludeBookingId &&
        ['ASSIGNED', 'IN_PROGRESS'].includes(b.status) &&
        b.slotStartTime < endTime &&
        b.slotEndTime > startTime
    ) ?? null;
  }

  async findConflictingSlotBooking(serviceId: number, startTime: Date, endTime: Date): Promise<Booking | null> {
    return this.items.find(
      (b) =>
        b.serviceId === serviceId &&
        ['CREATED', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS'].includes(b.status) &&
        b.slotStartTime.getTime() === startTime.getTime() &&
        b.slotEndTime.getTime() === endTime.getTime()
    ) ?? null;
  }

  async findExpiredPendingBookings(now: Date): Promise<Booking[]> {
    return this.items.filter((b) => b.status === 'CREATED' && b.expiryAt && b.expiryAt < now);
  }

  async update(booking: Booking): Promise<Booking> {
    const idx = this.items.findIndex((b) => b.id === booking.id);
    if (idx !== -1) this.items[idx] = booking;
    return booking;
  }
}

describe('Booking Engine Use Cases', () => {
  let bookingRepo: MemoryBookingRepository;
  let vehicleRepo: any;
  let addressRepo: any;
  let catalogRepo: any;
  let pricingRepo: any;
  let customerRepo: any;
  let partnerRepo: any;
  let txProvider: ITransactionProvider;

  let createUseCase: CreateBookingUseCase;
  let confirmUseCase: ConfirmBookingUseCase;
  let assignUseCase: AssignPartnerToBookingUseCase;
  let cancelUseCase: CancelBookingUseCase;
  let expireUseCase: ExpirePendingBookingsUseCase;

  beforeEach(() => {
    bookingRepo = new MemoryBookingRepository();

    const v = new Vehicle({
      id: 1,
      customerId: 10,
      make: 'Honda',
      model: 'City',
      year: 2022,
      registrationNumber: 'KA01AB1234',
      fuelType: 'PETROL',
    });

    vehicleRepo = {
      findById: async (id: number) => (id === 1 ? v : null),
    };

    addressRepo = {
      findById: async (id: number) => ({
        id: 1,
        addressLine1: '123 MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
      }),
    };

    catalogRepo = {
      findServiceById: async (id: number) => ({
        id: 1,
        name: 'Basic Car Wash',
        basePrice: 40000,
        estimatedDurationMinutes: 60,
        isActive: true,
      }),
      findAddonsByServiceId: async () => [],
    };

    pricingRepo = {
      findDefaultTierByServiceId: async () => null,
      findVehicleMultiplier: async () => ({ multiplier: 1.0 }),
    };

    customerRepo = {};

    partnerRepo = {
      findById: async (id: number) => ({ id, status: 'ACTIVE' }),
    };

    txProvider = {
      runInTransaction: async (cb) => cb(),
    };

    createUseCase = new CreateBookingUseCase(
      bookingRepo,
      vehicleRepo,
      addressRepo,
      catalogRepo,
      pricingRepo,
      customerRepo,
      txProvider
    );

    confirmUseCase = new ConfirmBookingUseCase(bookingRepo);
    assignUseCase = new AssignPartnerToBookingUseCase(bookingRepo, partnerRepo);
    cancelUseCase = new CancelBookingUseCase(bookingRepo);
    expireUseCase = new ExpirePendingBookingsUseCase(bookingRepo);
  });

  it('should create booking and calculate pricing snapshots in paise', async () => {
    const start = new Date(Date.now() + 3600000);
    const end = new Date(Date.now() + 7200000);

    const booking = await createUseCase.execute({
      customerId: 10,
      vehicleId: 1,
      addressId: 1,
      serviceId: 1,
      slotStartTime: start,
      slotEndTime: end,
    });

    expect(booking.status).toBe('CREATED');
    expect(booking.totalPricePaise).toBe(47200); // 40000 + 18% GST (7200)
    expect(booking.snapshots.vehicle.registrationNumber).toBe('KA01AB1234');
  });

  it('should prevent double booking of identical slot', async () => {
    const start = new Date(Date.now() + 3600000);
    const end = new Date(Date.now() + 7200000);

    await createUseCase.execute({
      customerId: 10,
      vehicleId: 1,
      addressId: 1,
      serviceId: 1,
      slotStartTime: start,
      slotEndTime: end,
    });

    await expect(
      createUseCase.execute({
        customerId: 10,
        vehicleId: 1,
        addressId: 1,
        serviceId: 1,
        slotStartTime: start,
        slotEndTime: end,
      })
    ).rejects.toThrow();
  });

  it('should confirm booking and assign eligible partner', async () => {
    const start = new Date(Date.now() + 3600000);
    const end = new Date(Date.now() + 7200000);

    const booking = await createUseCase.execute({
      customerId: 10,
      vehicleId: 1,
      addressId: 1,
      serviceId: 1,
      slotStartTime: start,
      slotEndTime: end,
    });

    const confirmed = await confirmUseCase.execute(booking.publicId!, 10);
    expect(confirmed.status).toBe('CONFIRMED');

    const assigned = await assignUseCase.execute(booking.publicId!, 99, 1);
    expect(assigned.status).toBe('ASSIGNED');
    expect(assigned.partnerId).toBe(99);
  });

  it('should expire unconfirmed booking slot holds', async () => {
    const start = new Date(Date.now() + 3600000);
    const end = new Date(Date.now() + 7200000);

    const booking = await createUseCase.execute({
      customerId: 10,
      vehicleId: 1,
      addressId: 1,
      serviceId: 1,
      slotStartTime: start,
      slotEndTime: end,
    });

    // Manually set expiry in the past
    booking.expiryAt = new Date(Date.now() - 1000);
    await bookingRepo.update(booking);

    const count = await expireUseCase.execute();
    expect(count).toBe(1);

    const updated = await bookingRepo.findById(booking.id!);
    expect(updated?.status).toBe('EXPIRED');
  });
});
