import { asFunction, type AwilixContainer } from 'awilix';
import type { BookingPersistenceClient } from './infrastructure/persistence/BookingPersistenceClient.js';
import { PrismaBookingRepository } from './infrastructure/repositories/PrismaBookingRepository.js';

interface PrismaProviderPort {
  getClient(): BookingPersistenceClient;
}

interface BookingCradle {
  prismaProvider: PrismaProviderPort;
}

export function registerBookingModule(container: AwilixContainer): void {
  container.register({
    bookingRepository: asFunction(
      (cradle: BookingCradle) => new PrismaBookingRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
  });
}
