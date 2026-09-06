import { asFunction, type AwilixContainer } from 'awilix';
import type { PrismaClient } from '@prisma/client';
import { PrismaPartnerRepository } from './infrastructure/repositories/PrismaPartnerRepository.js';
import { PrismaPartnerMemberRepository } from './infrastructure/repositories/PrismaPartnerMemberRepository.js';
import { PrismaPartnerProfileRepository } from './infrastructure/repositories/PrismaPartnerProfileRepository.js';

interface PrismaProviderPort {
  getClient(): PrismaClient;
}

interface PartnerProfileCradle {
  prismaProvider: PrismaProviderPort;
}

/** registerPartnerProfileModule is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerPartnerProfileModule(container: AwilixContainer): void {
  container.register({
    partnerRepository: asFunction(
      (cradle: PartnerProfileCradle) => new PrismaPartnerRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    partnerMemberRepository: asFunction(
      (cradle: PartnerProfileCradle) => new PrismaPartnerMemberRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    partnerProfileRepository: asFunction(
      (cradle: PartnerProfileCradle) => new PrismaPartnerProfileRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
  });
}
