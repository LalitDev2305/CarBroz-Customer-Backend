import { asClass } from 'awilix';
import { PrismaKycDocumentRepository } from './infrastructure/repositories/PrismaKycDocumentRepository.js';
export function registerPartnerKycModule(container) {
    container.register({
        kycDocumentRepository: asClass(PrismaKycDocumentRepository).singleton(),
    });
}
//# sourceMappingURL=partner-kyc.module.js.map