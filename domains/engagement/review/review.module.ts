import { asClass, type AwilixContainer } from 'awilix';
import { PrismaReviewRepository } from './infrastructure/repositories/PrismaReviewRepository.js';

export function registerReviewModule(container: AwilixContainer): void {
  container.register({
    reviewRepository: asClass(PrismaReviewRepository).singleton(),
  });
}
