import { asClass, type AwilixContainer } from 'awilix';
import { PrismaInvoiceRepository } from './infrastructure/repositories/PrismaInvoiceRepository.js';

/** registerInvoiceModule is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerInvoiceModule(container: AwilixContainer): void {
  container.register({
    invoiceRepository: asClass(PrismaInvoiceRepository).singleton(),
  });
}
