import { describe, expect, it, vi } from 'vitest';
import { Booking } from '../../domain/Booking.js';
import type { BookingPersistenceClient, BookingPersistenceRecord } from '../persistence/BookingPersistenceClient.js';
import { PrismaBookingRepository } from './PrismaBookingRepository.js';

const start = new Date('2026-09-07T10:00:00.000Z');
const end = new Date('2026-09-07T11:00:00.000Z');

const snapshots = {
  service: { serviceId: 4, name: 'Basic wash', basePricePaise: 49900, estimatedDurationMinutes: 60 },
  addons: [],
  pricing: {
    basePricePaise: 49900,
    addonsTotalPaise: 0,
    vehicleMultiplier: 1,
    subtotalPaise: 49900,
    taxesPaise: 0,
    totalPricePaise: 49900,
  },
  address: {
    addressLine1: 'Test address',
    city: 'Pune',
    state: 'Maharashtra',
    postalCode: '411001',
    country: 'India',
  },
  vehicle: {
    make: 'Test',
    model: 'Vehicle',
    year: 2026,
    registrationNumber: 'MH00TEST',
    fuelType: 'PETROL',
  },
};

const record = (overrides: Partial<BookingPersistenceRecord> = {}): BookingPersistenceRecord => ({
  id: 10,
  publicId: 'booking_10',
  customerId: 1,
  partnerId: null,
  vehicleId: 2,
  addressId: 3,
  serviceId: 4,
  status: 'CREATED',
  slotStartTime: start,
  slotEndTime: end,
  expiryAt: null,
  totalPricePaise: 49900,
  cancellationReason: null,
  snapshotsJson: snapshots,
  statusHistoryJson: [],
  createdAt: new Date('2026-09-06T00:00:00.000Z'),
  updatedAt: new Date('2026-09-06T00:00:00.000Z'),
  ...overrides,
});

function fixture() {
  const booking = {
    create: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  };
  const client = { booking } as unknown as BookingPersistenceClient;
  return { repository: new PrismaBookingRepository(client), booking };
}

function domainBooking(overrides: Partial<ConstructorParameters<typeof Booking>[0]> = {}) {
  return new Booking({
    id: 10,
    publicId: 'booking_10',
    customerId: 1,
    vehicleId: 2,
    addressId: 3,
    serviceId: 4,
    slotStartTime: start,
    slotEndTime: end,
    totalPricePaise: 49900,
    snapshots,
    statusHistory: [],
    ...overrides,
  });
}

describe('PrismaBookingRepository', () => {
  it('creates and maps nullable persistence fields without changing booking semantics', async () => {
    const { repository, booking } = fixture();
    booking.create.mockResolvedValue(record());

    const created = await repository.create(domainBooking());

    expect(created).toMatchObject({
      id: 10,
      publicId: 'booking_10',
      partnerId: null,
      expiryAt: null,
      cancellationReason: null,
      status: 'CREATED',
    });
    expect(booking.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ customerId: 1, vehicleId: 2, serviceId: 4 }),
    }));
  });

  it('maps populated optional persistence fields', async () => {
    const { repository, booking } = fixture();
    const expiryAt = new Date('2026-09-07T09:55:00.000Z');
    booking.findUnique.mockResolvedValue(record({ partnerId: 9, expiryAt, cancellationReason: 'weather' }));

    await expect(repository.findById(10)).resolves.toMatchObject({
      partnerId: 9,
      expiryAt,
      cancellationReason: 'weather',
    });
  });

  it('returns null for missing id and public-id reads and maps successful reads', async () => {
    const { repository, booking } = fixture();
    booking.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(record())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(record({ publicId: 'booking_public' }));

    await expect(repository.findById(999)).resolves.toBeNull();
    await expect(repository.findById(10)).resolves.toMatchObject({ id: 10 });
    await expect(repository.findByPublicId('missing')).resolves.toBeNull();
    await expect(repository.findByPublicId('booking_public')).resolves.toMatchObject({ publicId: 'booking_public' });
  });

  it('lists customer, partner and admin bookings with and without status filters', async () => {
    const { repository, booking } = fixture();
    booking.findMany.mockResolvedValue([record()]);

    await expect(repository.listByCustomerId(1)).resolves.toHaveLength(1);
    expect(booking.findMany).toHaveBeenNthCalledWith(1, expect.objectContaining({ where: { customerId: 1, status: undefined } }));
    await repository.listByCustomerId(1, 'CONFIRMED');
    expect(booking.findMany).toHaveBeenNthCalledWith(2, expect.objectContaining({ where: { customerId: 1, status: 'CONFIRMED' } }));

    await repository.listByPartnerId(9);
    expect(booking.findMany).toHaveBeenNthCalledWith(3, expect.objectContaining({ where: { partnerId: 9, status: undefined } }));
    await repository.listByPartnerId(9, 'ASSIGNED');
    expect(booking.findMany).toHaveBeenNthCalledWith(4, expect.objectContaining({ where: { partnerId: 9, status: 'ASSIGNED' } }));

    await repository.listAll();
    expect(booking.findMany).toHaveBeenNthCalledWith(5, expect.objectContaining({ where: { status: undefined }, take: 50, skip: 0 }));
    await repository.listAll('COMPLETED', 10, 20);
    expect(booking.findMany).toHaveBeenNthCalledWith(6, expect.objectContaining({ where: { status: 'COMPLETED' }, take: 10, skip: 20 }));
  });

  it('finds partner conflicts with and without an excluded booking', async () => {
    const { repository, booking } = fixture();
    booking.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(record({ partnerId: 9 }));

    await expect(repository.findConflictingPartnerBooking(9, start, end)).resolves.toBeNull();
    expect(booking.findFirst).toHaveBeenNthCalledWith(1, expect.objectContaining({
      where: expect.objectContaining({ partnerId: 9, id: undefined }),
    }));

    await expect(repository.findConflictingPartnerBooking(9, start, end, 10)).resolves.toMatchObject({ partnerId: 9 });
    expect(booking.findFirst).toHaveBeenNthCalledWith(2, expect.objectContaining({
      where: expect.objectContaining({ partnerId: 9, id: { not: 10 } }),
    }));
  });

  it('finds slot conflicts, expired holds and maps their empty variants', async () => {
    const { repository, booking } = fixture();
    booking.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(record());
    booking.findMany.mockResolvedValue([record()]);

    await expect(repository.findConflictingSlotBooking(4, start, end)).resolves.toBeNull();
    await expect(repository.findConflictingSlotBooking(4, start, end)).resolves.toMatchObject({ serviceId: 4 });
    await expect(repository.findExpiredPendingBookings(new Date('2026-09-08T00:00:00.000Z'))).resolves.toHaveLength(1);
  });

  it('updates mutable booking persistence state and maps the saved record', async () => {
    const { repository, booking } = fixture();
    booking.update.mockResolvedValue(record({ partnerId: 9, status: 'ASSIGNED' }));
    const entity = domainBooking({ partnerId: 9, status: 'ASSIGNED' });

    await expect(repository.update(entity)).resolves.toMatchObject({ partnerId: 9, status: 'ASSIGNED' });
    expect(booking.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: expect.objectContaining({ partnerId: 9, status: 'ASSIGNED' }),
    });
  });
});
