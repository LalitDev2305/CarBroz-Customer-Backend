import { asClass, asFunction, type AwilixContainer } from 'awilix';
import type { PrismaClient } from '@prisma/client';
import { CorporateCreditAccountingService } from './corporate/application/services/CorporateCreditAccountingService.js';
import { PrismaCorporateCreditLedgerRepository } from './corporate/infrastructure/repositories/PrismaCorporateCreditLedgerRepository.js';

interface CorporateLedgerCradle {
  prismaProvider: {
    getClient(): PrismaClient;
  };
}

/** Registers Financials-owned corporate credit accounting and ledger persistence. */
export function registerLedgerModule(container: AwilixContainer): void {
  container.register({
    creditLedgerRepo: asFunction(
      (cradle: CorporateLedgerCradle) => new PrismaCorporateCreditLedgerRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    corporateCreditAccounting: asClass(CorporateCreditAccountingService).classic().scoped(),
  });
}
