import { Money } from '@carbroz/foundation-kernel';
import { type DisputeReason } from '../DisputeReason.js';

export class DisputeSettlementCalculator {
  /**
   * Calculates maximum SLA refund eligible for a given dispute reason.
   */
  calculateRecommendedRefund(paidAmount: Money, reason: DisputeReason | string): Money {
    switch (reason) {
      case 'PARTNER_NO_SHOW':
        // 100% full refund for partner no show
        return paidAmount;
      case 'SERVICE_QUALITY_DEFECT':
        // 50% partial refund recommendation for service quality defect
        return Money.fromPaise(Math.floor(paidAmount.amountPaise * 0.5));
      case 'DELAYED_SERVICE':
        // 25% refund recommendation for delayed service
        return Money.fromPaise(Math.floor(paidAmount.amountPaise * 0.25));
      case 'WRONG_BILLING':
      case 'VEHICLE_DAMAGE':
      default:
        // Full requested amount capped at total paid amount
        return paidAmount;
    }
  }
}
