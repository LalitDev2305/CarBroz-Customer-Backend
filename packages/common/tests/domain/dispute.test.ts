import { describe, expect, it } from 'vitest';
import { Dispute, DisputeSettlementCalculator, Money } from '../../src/index.js';

describe('Phase 21 — Dispute Domain & Settlement Calculator', () => {
  it('should instantiate a valid Dispute entity with defaults', () => {
    const dispute = new Dispute({
      bookingId: 101,
      raisedByActorId: 5,
      raisedByActorType: 'CUSTOMER',
      disputeReason: 'SERVICE_QUALITY_DEFECT',
      requestedRefundAmount: Money.fromMinor(50000),
    });

    expect(dispute.bookingId).toBe(101);
    expect(dispute.raisedByActorId).toBe(5);
    expect(dispute.status).toBe('OPEN');
    expect(dispute.refundedAmount.amountMinor).toBe(0);
  });

  it('should resolve dispute with approved refund', () => {
    const dispute = new Dispute({
      bookingId: 101,
      raisedByActorId: 5,
      raisedByActorType: 'CUSTOMER',
      disputeReason: 'PARTNER_NO_SHOW',
      requestedRefundAmount: Money.fromMinor(50000),
    });

    dispute.resolveRefund(Money.fromMinor(50000), 'Partner did not show up');
    expect(dispute.status).toBe('RESOLVED_REFUNDED');
    expect(dispute.refundedAmount.amountMinor).toBe(50000);
    expect(dispute.resolvedAt).toBeDefined();
  });

  it('should reject dispute resolution', () => {
    const dispute = new Dispute({
      bookingId: 101,
      raisedByActorId: 5,
      raisedByActorType: 'CUSTOMER',
      disputeReason: 'DELAYED_SERVICE',
      requestedRefundAmount: Money.fromMinor(20000),
    });

    dispute.reject('Delay was within acceptable threshold');
    expect(dispute.status).toBe('RESOLVED_REJECTED');
    expect(dispute.refundedAmount.amountMinor).toBe(0);
  });

  it('should calculate SLA recommendations using DisputeSettlementCalculator', () => {
    const calculator = new DisputeSettlementCalculator();
    const paidAmount = Money.fromMinor(100000);

    const noShowRefund = calculator.calculateRecommendedRefund(paidAmount, 'PARTNER_NO_SHOW');
    expect(noShowRefund.amountMinor).toBe(100000);

    const qualityRefund = calculator.calculateRecommendedRefund(paidAmount, 'SERVICE_QUALITY_DEFECT');
    expect(qualityRefund.amountMinor).toBe(50000);

    const delayRefund = calculator.calculateRecommendedRefund(paidAmount, 'DELAYED_SERVICE');
    expect(delayRefund.amountMinor).toBe(25000);
  });
});
