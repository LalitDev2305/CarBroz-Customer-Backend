import { asClass, type AwilixContainer } from 'awilix';
import { PrismaPaymentRepository } from './infrastructure/repositories/PrismaPaymentRepository.js';

/** registerPaymentModule is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerPaymentModule(container: AwilixContainer): void {
  container.register({
    paymentRepository: asClass(PrismaPaymentRepository).singleton(),
  });
}
