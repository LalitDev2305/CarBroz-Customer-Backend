import { asClass, type AwilixContainer } from 'awilix';
import { PrismaInvoiceRepository } from './infrastructure/repositories/PrismaInvoiceRepository.js';

export function registerInvoiceModule(container: AwilixContainer): void {
  container.register({
    invoiceRepository: asClass(PrismaInvoiceRepository).singleton(),
  });
}
