import { asClass, asFunction, type AwilixContainer } from 'awilix';
import type { PrismaClient } from '@prisma/client';
import { PrismaInvoiceRepository } from './infrastructure/repositories/PrismaInvoiceRepository.js';
import { PrismaCorporateInvoiceRepository } from './corporate/infrastructure/repositories/PrismaCorporateInvoiceRepository.js';
import { GenerateCorporateInvoiceUseCase } from './corporate/application/use-cases/GenerateCorporateInvoiceUseCase.js';
import { ReconcileCorporatePaymentUseCase } from './corporate/application/use-cases/ReconcileCorporatePaymentUseCase.js';

interface InvoiceCradle {
  prismaProvider: {
    getClient(): PrismaClient;
  };
}

/** Registers Financials-owned invoice persistence and B2B invoice/payment application use cases. */
export function registerInvoiceModule(container: AwilixContainer): void {
  container.register({
    invoiceRepository: asClass(PrismaInvoiceRepository).singleton(),
    corporateInvoiceRepo: asFunction(
      (cradle: InvoiceCradle) => new PrismaCorporateInvoiceRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    generateCorporateInvoiceUseCase: asClass(GenerateCorporateInvoiceUseCase).classic().scoped(),
    reconcilePaymentUseCase: asClass(ReconcileCorporatePaymentUseCase).classic().scoped(),
  });
}
