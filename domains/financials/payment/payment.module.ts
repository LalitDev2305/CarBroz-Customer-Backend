import { asClass, type AwilixContainer } from 'awilix';
import { PrismaPaymentRepository } from './infrastructure/repositories/PrismaPaymentRepository.js';

export function registerPaymentModule(container: AwilixContainer): void {
  container.register({
    paymentRepository: asClass(PrismaPaymentRepository).singleton(),
  });
}
