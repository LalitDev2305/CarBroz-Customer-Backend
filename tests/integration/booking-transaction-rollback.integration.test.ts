import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Booking, type BookingSnapshots } from '@carbroz/domain-booking';
import { PrismaProvider, PrismaTransactionProvider } from '@carbroz/platform-database';
import { PrismaBookingRepository } from '../../domains/booking/infrastructure/repositories/PrismaBookingRepository.js';

const provider = new PrismaProvider();
const prisma = provider.getClient();
const suffix = randomUUID().replaceAll('-', '').slice(0, 12);
let userId = 0;
let categoryId = 0;

beforeAll(async () => {
  await provider.connect();
});

afterAll(async () => {
  if (categoryId) await prisma.serviceCategory.delete({ where: { id: categoryId } }).catch(() => undefined);
  if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
  await provider.disconnect();
});

describe('CW4 real PostgreSQL transaction propagation', () => {
  it('rolls back a Booking repository write performed through the exact transaction-bound Prisma client', async () => {
    const user = await prisma.user.create({ data: { phoneNumber: '+9198' + suffix.slice(0, 8) } });
    userId = user.id;
    const customer = await prisma.customerProfile.create({ data: { userId: user.id, firstName: 'CW4' } });
    const address = await prisma.address.create({ data: { userId: user.id, addressLine1: 'CW4 Road', city: 'Pune', state: 'MH', postalCode: '411001', country: 'IN' } });
    const category = await prisma.serviceCategory.create({ data: { name: 'CW4-' + suffix, slug: 'cw4-' + suffix } });
    categoryId = category.id;
    const service = await prisma.service.create({ data: { categoryId: category.id, name: 'Wash-' + suffix, slug: 'wash-' + suffix, basePrice: 1000, estimatedDurationMinutes: 60 } });
    const vehicle = await prisma.vehicle.create({ data: { customerId: customer.id, make: 'Tata', model: 'Nexon', year: 2026, registrationNumber: 'CW4' + suffix.slice(0, 7).toUpperCase(), fuelType: 'PETROL' } });

    const snapshots: BookingSnapshots = {
      service: { serviceId: service.id, name: service.name, basePricePaise: 1000, estimatedDurationMinutes: 60 },
      addons: [],
      pricing: { basePricePaise: 1000, addonsTotalPaise: 0, vehicleMultiplier: 1, subtotalPaise: 1000, taxesPaise: 180, totalPricePaise: 1180 },
      address: { addressLine1: address.addressLine1, city: address.city, state: address.state, postalCode: address.postalCode, country: address.country },
      vehicle: { make: vehicle.make, model: vehicle.model, year: vehicle.year, registrationNumber: vehicle.registrationNumber, fuelType: vehicle.fuelType },
    };
    const booking = new Booking({ customerId: customer.id, vehicleId: vehicle.id, addressId: address.id, serviceId: service.id, slotStartTime: new Date('2026-10-01T10:00:00Z'), slotEndTime: new Date('2026-10-01T11:00:00Z'), totalPricePaise: 1180, snapshots });
    const repository = new PrismaBookingRepository(prisma);
    const transactions = new PrismaTransactionProvider(provider);
    let rolledBackPublicId: string | undefined;

    await expect(transactions.runInTransaction(async (transaction) => {
      const created = await repository.create(booking, transaction);
      rolledBackPublicId = created.publicId;
      expect(await repository.findByPublicId(created.publicId!, transaction)).not.toBeNull();
      throw new Error('intentional-cw4-rollback');
    })).rejects.toThrow('intentional-cw4-rollback');

    expect(rolledBackPublicId).toBeDefined();
    expect(await prisma.booking.findUnique({ where: { publicId: rolledBackPublicId! } })).toBeNull();
  });
});
