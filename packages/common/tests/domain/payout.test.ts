import { describe, expect, it } from 'vitest';
import { PartnerPayout } from '../../src/domain/payout/PartnerPayout.js';

describe('PartnerPayout Domain Entity', () => {
  it('should initialize partner payout in SCHEDULED status', () => {
    const payout = new PartnerPayout({
      bookingId: 10,
      partnerId: 5,
      grossAmountPaise: 47200,
      commissionPaise: 7080,
      tdsPaise: 472,
      netPayoutPaise: 39648,
      calculationJson: {
        grossAmountPaise: 47200,
        commissionPercentage: 15,
        commissionPaise: 7080,
        tdsPercentage: 1,
        tdsPaise: 472,
        netPayoutPaise: 39648,
        appliedRules: ['Platform Commission: 15%', 'TDS u/s 194O: 1%'],
      },
    });

    expect(payout.status).toBe('SCHEDULED');
    expect(payout.netPayoutPaise).toBe(39648);
  });

  it('should handle approval, processing and marking as paid', () => {
    const payout = new PartnerPayout({
      bookingId: 10,
      partnerId: 5,
      grossAmountPaise: 47200,
      commissionPaise: 7080,
      tdsPaise: 472,
      netPayoutPaise: 39648,
      calculationJson: {
        grossAmountPaise: 47200,
        commissionPercentage: 15,
        commissionPaise: 7080,
        tdsPercentage: 1,
        tdsPaise: 472,
        netPayoutPaise: 39648,
        appliedRules: [],
      },
    });

    payout.approve();
    expect(payout.status).toBe('APPROVED');

    payout.markProcessing();
    expect(payout.status).toBe('PROCESSING');

    payout.markPaid('UTR_BANK_REF_987654');
    expect(payout.status).toBe('PAID');
    expect(payout.externalReference).toBe('UTR_BANK_REF_987654');
    expect(payout.paidAt).toBeInstanceOf(Date);
  });
});
