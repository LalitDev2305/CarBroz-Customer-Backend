import { asClass, type AwilixContainer } from 'awilix';
import { PrismaCustomerProfileRepository } from './infrastructure/repositories/PrismaCustomerProfileRepository.js';

export function registerCustomerProfileModule(container: AwilixContainer): void {
  container.register({
    customerProfileRepository: asClass(PrismaCustomerProfileRepository).singleton(),
  });
}
