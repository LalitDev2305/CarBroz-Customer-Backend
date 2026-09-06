import { asClass, type AwilixContainer } from 'awilix';
import { PrismaReviewRepository } from './infrastructure/repositories/PrismaReviewRepository.js';

/** registerReviewModule is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerReviewModule(container: AwilixContainer): void {
  container.register({
    reviewRepository: asClass(PrismaReviewRepository).singleton(),
  });
}
