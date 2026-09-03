import type { AwilixContainer } from 'awilix';
import { registerReviewModule } from './review/review.module.js';
import { registerCouponModule } from './coupon/coupon.module.js';

export function registerEngagementModule(container: AwilixContainer): void {
  registerReviewModule(container);
  registerCouponModule(container);
}
