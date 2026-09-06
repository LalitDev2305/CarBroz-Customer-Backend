import { asClass, type AwilixContainer } from 'awilix';
import { PrismaCouponRepository } from './infrastructure/repositories/PrismaCouponRepository.js';
import { PrismaCouponUsageRepository } from './infrastructure/repositories/PrismaCouponUsageRepository.js';

/** registerCouponModule is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerCouponModule(container: AwilixContainer): void {
  container.register({
    couponRepository: asClass(PrismaCouponRepository).singleton(),
    couponUsageRepository: asClass(PrismaCouponUsageRepository).singleton(),
  });
}
