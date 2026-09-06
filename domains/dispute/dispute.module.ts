import { asClass, type AwilixContainer } from 'awilix';
import { PrismaDisputeRepository } from './infrastructure/repositories/PrismaDisputeRepository.js';

/** registerDisputeModule is an exported domains/dispute contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerDisputeModule(container: AwilixContainer): void {
  container.register({
    disputeRepository: asClass(PrismaDisputeRepository).singleton(),
  });
}
