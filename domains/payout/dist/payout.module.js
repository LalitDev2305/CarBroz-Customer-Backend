import { asClass } from 'awilix';
import { PrismaPartnerPayoutRepository } from './infrastructure/repositories/PrismaPartnerPayoutRepository.js';
export function registerPayoutModule(container) {
    container.register({
        partnerPayoutRepository: asClass(PrismaPartnerPayoutRepository).singleton(),
    });
}
//# sourceMappingURL=payout.module.js.map