import { asClass, type AwilixContainer } from 'awilix';
import { PrismaDisputeRepository } from './infrastructure/repositories/PrismaDisputeRepository.js';

export function registerDisputeModule(container: AwilixContainer): void {
  container.register({
    disputeRepository: asClass(PrismaDisputeRepository).singleton(),
  });
}
