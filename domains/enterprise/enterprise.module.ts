import { asClass, asFunction, type AwilixContainer } from 'awilix';
import type { PrismaClient } from '@prisma/client';
import { PrismaCorporateAccountRepository } from './infrastructure/repositories/PrismaCorporateAccountRepository.js';
import { PrismaCorporateMemberRepository } from './infrastructure/repositories/PrismaCorporateMemberRepository.js';
import { PrismaCorporateFleetVehicleRepository } from './infrastructure/repositories/PrismaCorporateFleetVehicleRepository.js';
import { PrismaCorporateCreditLedgerRepository } from './infrastructure/repositories/PrismaCorporateCreditLedgerRepository.js';
import { PrismaCorporateInvoiceRepository } from './infrastructure/repositories/PrismaCorporateInvoiceRepository.js';
import { RegisterCorporateAccountUseCase } from './use-cases/RegisterCorporateAccountUseCase.js';
import { ApproveCorporateAccountUseCase } from './use-cases/ApproveCorporateAccountUseCase.js';
import { AdjustCreditLimitUseCase } from './use-cases/AdjustCreditLimitUseCase.js';
import { AddCorporateMemberUseCase } from './use-cases/AddCorporateMemberUseCase.js';
import { RemoveCorporateMemberUseCase } from './use-cases/RemoveCorporateMemberUseCase.js';
import { EnrollFleetVehicleUseCase } from './use-cases/EnrollFleetVehicleUseCase.js';
import { RemoveFleetVehicleUseCase } from './use-cases/RemoveFleetVehicleUseCase.js';
import { ValidateCorporateBookingUseCase } from './use-cases/ValidateCorporateBookingUseCase.js';
import { GenerateCorporateInvoiceUseCase } from './use-cases/GenerateCorporateInvoiceUseCase.js';
import { ReconcileCorporatePaymentUseCase } from './use-cases/ReconcileCorporatePaymentUseCase.js';

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
    registerAccountUseCase: asClass(RegisterCorporateAccountUseCase).classic().scoped(),
    approveAccountUseCase: asClass(ApproveCorporateAccountUseCase).classic().scoped(),
    adjustCreditLimitUseCase: asClass(AdjustCreditLimitUseCase).classic().scoped(),
    addMemberUseCase: asClass(AddCorporateMemberUseCase).classic().scoped(),
    removeMemberUseCase: asClass(RemoveCorporateMemberUseCase).classic().scoped(),
    enrollFleetVehicleUseCase: asClass(EnrollFleetVehicleUseCase).classic().scoped(),
    removeFleetVehicleUseCase: asClass(RemoveFleetVehicleUseCase).classic().scoped(),
    validateCorporateBookingUseCase: asClass(ValidateCorporateBookingUseCase).classic().scoped(),
    generateCorporateInvoiceUseCase: asClass(GenerateCorporateInvoiceUseCase).classic().scoped(),
    reconcilePaymentUseCase: asClass(ReconcileCorporatePaymentUseCase).classic().scoped(),
  });
}
