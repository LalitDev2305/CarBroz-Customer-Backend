import type { AwilixContainer } from 'awilix';
import { registerReviewModule } from './review/review.module.js';
import { registerCouponModule } from './coupon/coupon.module.js';

/** registerEngagementModule is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerEngagementModule(container: AwilixContainer): void {
  registerReviewModule(container);
  registerCouponModule(container);
}
