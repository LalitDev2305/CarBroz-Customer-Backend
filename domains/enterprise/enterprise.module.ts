import { asFunction, type AwilixContainer } from 'awilix';
import type { PrismaClient } from '@prisma/client';
import { PrismaCorporateAccountRepository } from './infrastructure/repositories/PrismaCorporateAccountRepository.js';
import { PrismaCorporateMemberRepository } from './infrastructure/repositories/PrismaCorporateMemberRepository.js';
import { PrismaCorporateFleetVehicleRepository } from './infrastructure/repositories/PrismaCorporateFleetVehicleRepository.js';
import { PrismaCorporateCreditLedgerRepository } from './infrastructure/repositories/PrismaCorporateCreditLedgerRepository.js';
import { PrismaCorporateInvoiceRepository } from './infrastructure/repositories/PrismaCorporateInvoiceRepository.js';

interface EnterpriseCradle {
  prismaProvider: {
    getClient(): PrismaClient;
  };
}

export function registerEnterpriseModule(container: AwilixContainer): void {
  container.register({
    corporateAccountRepo: asFunction(
      (cradle: EnterpriseCradle) => new PrismaCorporateAccountRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    corporateMemberRepo: asFunction(
      (cradle: EnterpriseCradle) => new PrismaCorporateMemberRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    fleetVehicleRepo: asFunction(
      (cradle: EnterpriseCradle) => new PrismaCorporateFleetVehicleRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    creditLedgerRepo: asFunction(
      (cradle: EnterpriseCradle) => new PrismaCorporateCreditLedgerRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    corporateInvoiceRepo: asFunction(
      (cradle: EnterpriseCradle) => new PrismaCorporateInvoiceRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
  });
}
