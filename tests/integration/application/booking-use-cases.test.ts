import {
  Booking,
  type BookingStatus,
  type IBookingRepository,
} from '@carbroz/domain-booking';
import { Vehicle } from '@carbroz/domain-customer';
import type { IPartnerRepository } from '@carbroz/domain-partner';
import type {
  ExecutionContext,
  ITransactionProvider,
  TransactionContext,
} from '@carbroz/foundation-kernel';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  CancelBookingUseCase,
  ConfirmBookingUseCase,
  CreateBookingUseCase,
  ExpirePendingBookingsUseCase,
} from '@carbroz/domain-booking';
import { AssignPartnerToBookingUseCase } from '@carbroz/domain-operations';

const transaction: TransactionContext = { resource: {} };
const customerContext: ExecutionContext = {
  correlationId: 'booking-integration-customer',
  timestamp: new Date('2026-09-06T12:00:00Z'),
  actor: {
    id: 100,
    kind: 'CUSTOMER',
    roles: ['CUSTOMER'],
    customerId: 10,
  },
};
const systemContext: ExecutionContext = {
  correlationId: 'booking-integration-system',
  timestamp: new Date('2026-09-06T12:00:00Z'),
  actor: { id: 1, kind: 'SYSTEM', roles: ['SYSTEM'] },
};

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
    return this.items.find((booking) => booking.id === id) ?? null;
  }

  async findByPublicId(publicId: string): Promise<Booking | null> {
    return this.items.find((booking) => booking.publicId === publicId) ?? null;
  }

  async listByCustomerId(
    customerId: number,
    status?: BookingStatus,
  ): Promise<Booking[]> {
    return this.items.filter(
      (booking) =>
        booking.customerId === customerId && (!status || booking.status === status),
    );
  }

  async listByPartnerId(
    partnerId: number,
    status?: BookingStatus,
  ): Promise<Booking[]> {
    return this.items.filter(
      (booking) =>
        booking.partnerId === partnerId && (!status || booking.status === status),
    );
  }

  async listByCorporateAccountId(
    corporateAccountId: number,
    status?: BookingStatus,
  ): Promise<Booking[]> {
    return this.items.filter(
      (booking) =>
        booking.corporateAccountId === corporateAccountId &&
        (!status || booking.status === status),
    );
  }

  async listAll(
    status?: BookingStatus,
    limit = 50,
    offset = 0,
  ): Promise<Booking[]> {
    return this.items
      .filter((booking) => !status || booking.status === status)
      .slice(offset, offset + limit);
  }

  async findConflictingPartnerBooking(
    partnerId: number,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: number,
  ): Promise<Booking | null> {
    return (
      this.items.find(
        (booking) =>
          booking.partnerId === partnerId &&
          booking.id !== excludeBookingId &&
          ['ASSIGNED', 'IN_PROGRESS'].includes(booking.status) &&
          booking.slotStartTime < endTime &&
          booking.slotEndTime > startTime,
      ) ?? null
    );
  }

  async findConflictingSlotBooking(
    serviceId: number,
    startTime: Date,
    endTime: Date,
  ): Promise<Booking | null> {
    return (
      this.items.find(
        (booking) =>
          booking.serviceId === serviceId &&
          ['CREATED', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS'].includes(
            booking.status,
          ) &&
          booking.slotStartTime.getTime() === startTime.getTime() &&
          booking.slotEndTime.getTime() === endTime.getTime(),
      ) ?? null
    );
  }

  async findExpiredPendingBookings(now: Date): Promise<Booking[]> {
    return this.items.filter(
      (booking) =>
        booking.status === 'CREATED' &&
        booking.expiryAt !== null &&
        booking.expiryAt < now,
    );
  }

  async update(booking: Booking): Promise<Booking> {
    const index = this.items.findIndex((item) => item.id === booking.id);
    if (index !== -1) this.items[index] = booking;
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
  let partnerRepo: IPartnerRepository;
  let txProvider: ITransactionProvider;

  let createUseCase: CreateBookingUseCase;
  let confirmUseCase: ConfirmBookingUseCase;
  let assignUseCase: AssignPartnerToBookingUseCase;
  let cancelUseCase: CancelBookingUseCase;
  let expireUseCase: ExpirePendingBookingsUseCase;

  beforeEach(() => {
    bookingRepo = new MemoryBookingRepository();

    const vehicle = new Vehicle({
      id: 1,
      customerId: 10,
      make: 'Honda',
      model: 'City',
      year: 2022,
      registrationNumber: 'KA01AB1234',
      fuelType: 'PETROL',
    });

    vehicleRepo = {
      findById: async (id: number) => (id === 1 ? vehicle : null),
    };

    addressRepo = {
      findById: async () => ({
        id: 1,
        userId: 100,
        addressLine1: '123 MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
      }),
    };

    catalogRepo = {
      findServiceById: async () => ({
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

    customerRepo = {
      findByUserId: async () => ({ id: 10 }),
    };

    partnerRepo = {
      findById: async (id: number) =>
        ({ id, status: 'ACTIVE' }) as Awaited<ReturnType<IPartnerRepository['findById']>>,
    } as IPartnerRepository;

    txProvider = {
      runInTransaction: async (work) => work(transaction),
    };

    createUseCase = new CreateBookingUseCase(
      bookingRepo,
      vehicleRepo,
      addressRepo,
      catalogRepo,
      pricingRepo,
      customerRepo,
      txProvider,
    );

    confirmUseCase = new ConfirmBookingUseCase(bookingRepo, customerRepo);
    assignUseCase = new AssignPartnerToBookingUseCase(bookingRepo, partnerRepo);
    cancelUseCase = new CancelBookingUseCase(bookingRepo, customerRepo);
    expireUseCase = new ExpirePendingBookingsUseCase(bookingRepo, txProvider);
    void cancelUseCase;
  });

  it('should create booking and calculate pricing snapshots in paise', async () => {
    const start = new Date(Date.now() + 3_600_000);
    const end = new Date(Date.now() + 7_200_000);

    const booking = await createUseCase.execute(
      {
        customerId: 10,
        vehicleId: 1,
        addressId: 1,
        serviceId: 1,
        slotStartTime: start,
        slotEndTime: end,
      },
      customerContext,
    );

    expect(booking.status).toBe('CREATED');
    expect(booking.totalPricePaise).toBe(47_200);
    expect(booking.snapshots.vehicle.registrationNumber).toBe('KA01AB1234');
  });

  it('should prevent double booking of identical slot', async () => {
    const start = new Date(Date.now() + 3_600_000);
    const end = new Date(Date.now() + 7_200_000);
    const command = {
      customerId: 10,
      vehicleId: 1,
      addressId: 1,
      serviceId: 1,
      slotStartTime: start,
      slotEndTime: end,
    };

    await createUseCase.execute(command, customerContext);
    await expect(createUseCase.execute(command, customerContext)).rejects.toThrow(
      'Selected service slot is no longer available',
    );
  });

  it('should confirm booking and assign eligible partner', async () => {
    const start = new Date(Date.now() + 3_600_000);
    const end = new Date(Date.now() + 7_200_000);

    const booking = await createUseCase.execute(
      {
        customerId: 10,
        vehicleId: 1,
        addressId: 1,
        serviceId: 1,
        slotStartTime: start,
        slotEndTime: end,
      },
      customerContext,
    );

    const confirmed = await confirmUseCase.execute(
      booking.publicId!,
      customerContext,
    );
    expect(confirmed.status).toBe('CONFIRMED');

    const assigned = await assignUseCase.execute(booking.publicId!, 99, 1);
    expect(assigned.status).toBe('ASSIGNED');
    expect(assigned.partnerId).toBe(99);
  });

  it('should expire unconfirmed booking slot holds', async () => {
    const start = new Date(Date.now() + 3_600_000);
    const end = new Date(Date.now() + 7_200_000);

    const booking = await createUseCase.execute(
      {
        customerId: 10,
        vehicleId: 1,
        addressId: 1,
        serviceId: 1,
        slotStartTime: start,
        slotEndTime: end,
      },
      customerContext,
    );

    booking.expiryAt = new Date(Date.now() - 1_000);
    await bookingRepo.update(booking);

    const count = await expireUseCase.execute(systemContext);
    expect(count).toBe(1);

    const updated = await bookingRepo.findById(booking.id!);
    expect(updated?.status).toBe('EXPIRED');
  });
});
