import { asClass, type AwilixContainer } from 'awilix';
import { PrismaCouponRepository } from './infrastructure/repositories/PrismaCouponRepository.js';
import { PrismaCouponUsageRepository } from './infrastructure/repositories/PrismaCouponUsageRepository.js';

export function registerCouponModule(container: AwilixContainer): void {
  container.register({
    couponRepository: asClass(PrismaCouponRepository).singleton(),
    couponUsageRepository: asClass(PrismaCouponUsageRepository).singleton(),
  });
}
