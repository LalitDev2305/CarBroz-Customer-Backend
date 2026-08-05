import { Money } from '../../value-objects/Money.js';
import { DisputeReason } from '../DisputeReason.js';
export declare class DisputeSettlementCalculator {
    /**
     * Calculates maximum SLA refund eligible for a given dispute reason.
     */
    calculateRecommendedRefund(paidAmount: Money, reason: DisputeReason | string): Money;
}
