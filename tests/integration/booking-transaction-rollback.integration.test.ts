import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Booking, type BookingSnapshots } from '@carbroz/domain-booking';
import {
  PrismaProvider,
  PrismaTransactionProvider,
} from '@carbroz/platform-database';
import { PrismaBookingRepository } from '../../domains/booking/infrastructure/repositories/PrismaBookingRepository.js';

const provider = new PrismaProvider();
const prisma = provider.getClient();
let createdBookingFixture = false;

const snapshots: BookingSnapshots = {
  service: {
    serviceId: 1,
    name: 'CW4 rollback service',
    basePricePaise: 1_000,
    estimatedDurationMinutes: 60,
  },
  addons: [],
  pricing: {
    basePricePaise: 1_000,
    addonsTotalPaise: 0,
    vehicleMultiplier: 1,
    subtotalPaise: 1_000,
    taxesPaise: 180,
    totalPricePaise: 1_180,
  },
  address: {
    addressLine1: 'CW4 Road',
    city: 'Pune',
    state: 'MH',
    postalCode: '411001',
    country: 'IN',
  },
  vehicle: {
    make: 'Tata',
    model: 'Nexon',
    year: 2026,
    registrationNumber: 'CW4ROLLBACK',
    fuelType: 'PETROL',
  },
};

beforeAll(async () => {
  await provider.connect();

  const existing = await prisma.$queryRawUnsafe<Array<{ relation: string | null }>>(
    "SELECT to_regclass('public.bookings')::text AS relation",
  );

  if (!existing[0]?.relation) {
    // CW4 isolates transaction propagation from the repository's unrelated
    // migration-completeness backlog. This fixture mirrors the Booking
    // persistence contract closely enough for PrismaBookingRepository to use
    // a real PostgreSQL table and the real transaction-bound Prisma client.
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "bookings" (
        "id" SERIAL PRIMARY KEY,
        "publicId" TEXT NOT NULL UNIQUE,
        "customer_id" INTEGER NOT NULL,
        "partner_id" INTEGER,
        "vehicle_id" INTEGER NOT NULL,
        "address_id" INTEGER NOT NULL,
        "service_id" INTEGER NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'CREATED',
        "slot_start_time" TIMESTAMP(3) NOT NULL,
        "slot_end_time" TIMESTAMP(3) NOT NULL,
        "expiry_at" TIMESTAMP(3),
        "total_price_paise" INTEGER NOT NULL,
        "cancellation_reason" TEXT,
        "snapshots_json" JSONB NOT NULL,
        "status_history_json" JSONB NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "corporate_account_id" INTEGER,
        "corporate_fleet_vehicle_id" INTEGER
      )
    `);
    createdBookingFixture = true;
  }
});

afterAll(async () => {
  if (createdBookingFixture) {
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "bookings"');
  }
  await provider.disconnect();
});

describe('CW4 real PostgreSQL transaction propagation', () => {
  it('rolls back a Booking repository write performed through the exact transaction-bound Prisma client', async () => {
    const booking = new Booking({
      customerId: 10,
      vehicleId: 20,
      addressId: 30,
      serviceId: 40,
      slotStartTime: new Date('2026-10-01T10:00:00Z'),
      slotEndTime: new Date('2026-10-01T11:00:00Z'),
      totalPricePaise: 1_180,
      snapshots,
    });
    const repository = new PrismaBookingRepository(prisma);
    const transactions = new PrismaTransactionProvider(provider);
    let rolledBackPublicId: string | undefined;

    await expect(
      transactions.runInTransaction(async (transaction) => {
        const created = await repository.create(booking, transaction);
        rolledBackPublicId = created.publicId;
        expect(
          await repository.findByPublicId(created.publicId!, transaction),
        ).not.toBeNull();
        throw new Error('intentional-cw4-rollback');
      }),
    ).rejects.toThrow('intentional-cw4-rollback');

    expect(rolledBackPublicId).toBeDefined();
    expect(
      await prisma.booking.findUnique({ where: { publicId: rolledBackPublicId! } }),
    ).toBeNull();
  });
});
