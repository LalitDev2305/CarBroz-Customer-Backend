import { asClass, type AwilixContainer } from 'awilix';
import { PrismaBookingRepository } from './infrastructure/repositories/PrismaBookingRepository.js';

export function registerBookingModule(container: AwilixContainer): void {
  container.register({
    bookingRepository: asClass(PrismaBookingRepository).singleton(),
  });
}
