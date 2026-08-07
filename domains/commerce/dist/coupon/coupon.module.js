import { asClass } from 'awilix';
import { PrismaCouponRepository } from './infrastructure/repositories/PrismaCouponRepository.js';
import { PrismaCouponUsageRepository } from './infrastructure/repositories/PrismaCouponUsageRepository.js';
export function registerCouponModule(container) {
    container.register({
        couponRepository: asClass(PrismaCouponRepository).singleton(),
        couponUsageRepository: asClass(PrismaCouponUsageRepository).singleton(),
    });
}
//# sourceMappingURL=coupon.module.js.map