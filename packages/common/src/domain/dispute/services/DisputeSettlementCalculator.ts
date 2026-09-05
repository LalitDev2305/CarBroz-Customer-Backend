import { Money } from '../../value-objects/Money.js';
import { DisputeReason } from '../DisputeReason.js';

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
