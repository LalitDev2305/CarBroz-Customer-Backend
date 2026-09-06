import { asClass, type AwilixContainer } from 'awilix';
import { PrismaTrackingSessionRepository } from './infrastructure/repositories/PrismaTrackingSessionRepository.js';

/** registerTrackingModule is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerTrackingModule(container: AwilixContainer): void {
  container.register({
    trackingSessionRepository: asClass(PrismaTrackingSessionRepository).singleton(),
  });
}
