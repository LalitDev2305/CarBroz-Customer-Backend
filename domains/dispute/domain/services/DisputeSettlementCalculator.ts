import { Money } from '@carbroz/foundation-kernel';
import { DisputeReason } from '../DisputeReason.js';

/** DisputeSettlementCalculator is an exported domains/dispute contract/implementation; see the owning README for lifecycle and extension rules. */
export class DisputeSettlementCalculator {
  /**
   * Calculates maximum SLA refund eligible for a given dispute reason.
   */
  calculateRecommendedRefund(paidAmount: Money, reason: DisputeReason | string): Money {
    switch (reason) {
      case 'PARTNER_NO_SHOW':
        return paidAmount;
      case 'SERVICE_QUALITY_DEFECT':
        return Money.fromMinor(Math.floor(paidAmount.amountMinor * 0.5));
      case 'DELAYED_SERVICE':
        return Money.fromMinor(Math.floor(paidAmount.amountMinor * 0.25));
      case 'WRONG_BILLING':
      case 'VEHICLE_DAMAGE':
      default:
        return paidAmount;
    }
  }
}
