import { asClass } from 'awilix';
import { PrismaPartnerRepository } from './infrastructure/repositories/PrismaPartnerRepository.js';
import { PrismaPartnerMemberRepository } from './infrastructure/repositories/PrismaPartnerMemberRepository.js';
import { PrismaPartnerProfileRepository } from './infrastructure/repositories/PrismaPartnerProfileRepository.js';
export function registerPartnerProfileModule(container) {
    container.register({
        partnerRepository: asClass(PrismaPartnerRepository).singleton(),
        partnerMemberRepository: asClass(PrismaPartnerMemberRepository).singleton(),
        partnerProfileRepository: asClass(PrismaPartnerProfileRepository).singleton(),
    });
}
//# sourceMappingURL=partner-profile.module.js.map