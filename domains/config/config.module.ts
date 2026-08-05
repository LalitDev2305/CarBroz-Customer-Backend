import { asClass, type AwilixContainer } from 'awilix';
import { PrismaConfigRepository } from './infrastructure/repositories/PrismaConfigRepository.js';

export function registerConfigModule(container: AwilixContainer): void {
  container.register({
    configRepository: asClass(PrismaConfigRepository).singleton(),
  });
}
