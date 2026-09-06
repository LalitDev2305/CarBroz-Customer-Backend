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
let createdBookingStatusFixture = false;
let fixtureUserId: number | undefined;
let fixtureCustomerId: number | undefined;
let fixtureVehicleId: number | undefined;
let fixtureAddressId: number | undefined;
let fixtureServiceId: number | undefined;
let fixtureServiceCategoryId: number | undefined;

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

  const existingBookingStatus = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(`
    SELECT EXISTS (
      SELECT 1
      FROM pg_type AS type
      INNER JOIN pg_namespace AS namespace
        ON namespace.oid = type.typnamespace
      WHERE namespace.nspname = 'public'
        AND type.typname = 'BookingStatus'
    ) AS exists
  `);

  if (!existingBookingStatus[0]?.exists) {
    // Prisma serializes Booking.status through the schema enum even when CW4
    // intentionally supplies an isolated persistence fixture. Reproduce that
    // exact PostgreSQL contract so the proof reaches the transaction boundary.
    await prisma.$executeRawUnsafe(`
      CREATE TYPE "BookingStatus" AS ENUM (
        'CREATED',
        'CONFIRMED',
        'ASSIGNED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'EXPIRED'
      )
    `);
    createdBookingStatusFixture = true;
  }

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
        "status" "BookingStatus" NOT NULL DEFAULT 'CREATED',
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

  // The reconciled fresh schema enforces Booking's real foreign keys. Seed
  // valid prerequisites outside the transaction under test so this proof
  // reaches the intentional rollback boundary rather than failing on fixture
  // integrity first.
  const fixtureSuffix = `${Date.now()}-${process.pid}`;
  const user = await prisma.user.create({ data: {} });
  fixtureUserId = user.id;

  const customer = await prisma.customerProfile.create({
    data: { userId: user.id },
  });
  fixtureCustomerId = customer.id;

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      label: 'CW4 rollback fixture',
      addressLine1: 'CW4 Road',
      city: 'Pune',
      state: 'MH',
      postalCode: '411001',
      country: 'IN',
    },
  });
  fixtureAddressId = address.id;

  const serviceCategory = await prisma.serviceCategory.create({
    data: {
      name: `CW4 rollback ${fixtureSuffix}`,
      slug: `cw4-rollback-${fixtureSuffix}`,
    },
  });
  fixtureServiceCategoryId = serviceCategory.id;

  const service = await prisma.service.create({
    data: {
      categoryId: serviceCategory.id,
      name: 'CW4 rollback service',
      slug: `cw4-rollback-service-${fixtureSuffix}`,
      basePrice: 1_000,
      estimatedDurationMinutes: 60,
    },
  });
  fixtureServiceId = service.id;

  const vehicle = await prisma.vehicle.create({
    data: {
      customerId: customer.id,
      make: 'Tata',
      model: 'Nexon',
      year: 2026,
      registrationNumber: `CW4-${fixtureSuffix}`,
      fuelType: 'PETROL',
    },
  });
  fixtureVehicleId = vehicle.id;
});

afterAll(async () => {
  if (createdBookingFixture) {
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "bookings"');
  }
  if (fixtureVehicleId !== undefined) {
    await prisma.vehicle.delete({ where: { id: fixtureVehicleId } });
  }
  if (fixtureAddressId !== undefined) {
    await prisma.address.delete({ where: { id: fixtureAddressId } });
  }
  if (fixtureCustomerId !== undefined) {
    await prisma.customerProfile.delete({ where: { id: fixtureCustomerId } });
  }
  if (fixtureUserId !== undefined) {
    await prisma.user.delete({ where: { id: fixtureUserId } });
  }
  if (fixtureServiceId !== undefined) {
    await prisma.service.delete({ where: { id: fixtureServiceId } });
  }
  if (fixtureServiceCategoryId !== undefined) {
    await prisma.serviceCategory.delete({ where: { id: fixtureServiceCategoryId } });
  }
  if (createdBookingStatusFixture) {
    await prisma.$executeRawUnsafe('DROP TYPE IF EXISTS "BookingStatus"');
  }
  await provider.disconnect();
});

describe('CW4 real PostgreSQL transaction propagation', () => {
  it('rolls back a Booking repository write performed through the exact transaction-bound Prisma client', async () => {
    expect(fixtureCustomerId).toBeDefined();
    expect(fixtureVehicleId).toBeDefined();
    expect(fixtureAddressId).toBeDefined();
    expect(fixtureServiceId).toBeDefined();

    const booking = new Booking({
      customerId: fixtureCustomerId!,
      vehicleId: fixtureVehicleId!,
      addressId: fixtureAddressId!,
      serviceId: fixtureServiceId!,
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
