import { describe, expect, it } from 'vitest';
import { Invoice } from '../../src/domain/invoice/Invoice.js';

describe('Invoice Domain Entity', () => {
  it('should initialize valid GST invoice document', () => {
    const inv = new Invoice({
      bookingId: 10,
      invoiceNumber: 'INV-2026-000001',
      amountPaise: 47200,
      documentJson: {
        invoiceNumber: 'INV-2026-000001',
        bookingPublicId: 'bk_10',
        serviceName: 'Car Wash',
        basePricePaise: 40000,
        addonsTotalPaise: 0,
        subtotalPaise: 40000,
        cgstPaise: 3600,
        sgstPaise: 3600,
        igstPaise: 0,
        totalTaxPaise: 7200,
        totalPricePaise: 47200,
        currency: 'INR',
        issuedAt: new Date(),
      },
    });

    expect(inv.status).toBe('ISSUED');
    expect(inv.documentJson.cgstPaise).toBe(3600);
    expect(inv.documentJson.sgstPaise).toBe(3600);
  });
});
