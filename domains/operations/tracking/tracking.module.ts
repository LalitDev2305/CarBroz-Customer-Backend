import { asClass, type AwilixContainer } from 'awilix';
import { PrismaTrackingSessionRepository } from './infrastructure/repositories/PrismaTrackingSessionRepository.js';

export function registerTrackingModule(container: AwilixContainer): void {
  container.register({
    trackingSessionRepository: asClass(PrismaTrackingSessionRepository).singleton(),
  });
}
