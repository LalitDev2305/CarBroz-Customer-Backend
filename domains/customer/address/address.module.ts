import { asClass, type AwilixContainer } from 'awilix';
import { PrismaAddressRepository } from './infrastructure/repositories/PrismaAddressRepository.js';

export function registerAddressModule(container: AwilixContainer): void {
  container.register({
    addressRepository: asClass(PrismaAddressRepository).singleton(),
  });
}
