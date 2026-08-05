import { asClass } from 'awilix';
import { PrismaReviewRepository } from './infrastructure/repositories/PrismaReviewRepository.js';
export function registerReviewModule(container) {
    container.register({
        reviewRepository: asClass(PrismaReviewRepository).singleton(),
    });
}
//# sourceMappingURL=review.module.js.map