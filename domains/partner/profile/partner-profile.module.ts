import { asClass, type AwilixContainer } from 'awilix';
import { PrismaPartnerRepository } from './infrastructure/repositories/PrismaPartnerRepository.js';
import { PrismaPartnerMemberRepository } from './infrastructure/repositories/PrismaPartnerMemberRepository.js';
import { PrismaPartnerProfileRepository } from './infrastructure/repositories/PrismaPartnerProfileRepository.js';

export function registerPartnerProfileModule(container: AwilixContainer): void {
  container.register({
    partnerRepository: asClass(PrismaPartnerRepository).singleton(),
    partnerMemberRepository: asClass(PrismaPartnerMemberRepository).singleton(),
    partnerProfileRepository: asClass(PrismaPartnerProfileRepository).singleton(),
  });
}
