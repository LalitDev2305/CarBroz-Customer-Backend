import { describe, it, expect } from 'vitest';
import {
  CorporateAccount,
  CorporateMember,
  CorporateFleetVehicle,
  CorporateCreditLedger,
  CorporateInvoice,
  Money,
} from '../../src/index.js';

describe('Phase 22 — Corporate Accounts, Fleet Management & B2B Billing Domain Unit Tests', () => {
  it('should instantiate CorporateAccount and manage credit limits correctly', () => {
    const account = new CorporateAccount({
      companyName: 'Acme Corp',
      legalName: 'Acme Enterprises Pvt Ltd',
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      billingAddress: {
        addressLine1: 'Tech Park Rd',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
      },
    });

    expect(account.status).toBe('PENDING_APPROVAL');
    expect(account.creditLimitPaise).toBe(0n);
    expect(account.canCoverAmount(Money.fromPaise(50000))).toBe(false);

    account.approve(Money.fromPaise(500000)); // 5000 INR
    expect(account.status).toBe('ACTIVE');
    expect(account.creditLimitPaise).toBe(500000n);
    expect(account.canCoverAmount(Money.fromPaise(50000))).toBe(true);

    account.adjustCreditLimit(Money.fromPaise(1000000)); // 10000 INR
    expect(account.creditLimitPaise).toBe(1000000n);

    account.suspend('Payment default');
    expect(account.status).toBe('SUSPENDED');
    expect(account.canCoverAmount(Money.fromPaise(50000))).toBe(false);
  });

  it('should instantiate CorporateMember and update status', () => {
    const member = new CorporateMember({
      corporateAccountId: 1,
      userId: 42,
      role: 'CORP_ADMIN',
      monthlyCapPaise: 500000,
    });

    expect(member.role).toBe('CORP_ADMIN');
    expect(member.status).toBe('ACTIVE');
    expect(member.monthlyCapPaise).toBe(500000n);

    member.deactivate();
    expect(member.status).toBe('INACTIVE');
  });

  it('should instantiate CorporateFleetVehicle and update status', () => {
    const fleetVehicle = new CorporateFleetVehicle({
      corporateAccountId: 1,
      vehicleId: 10,
      department: 'Logistics',
      costCenter: 'CC-101',
    });

    expect(fleetVehicle.department).toBe('Logistics');
    expect(fleetVehicle.status).toBe('ACTIVE');

    fleetVehicle.deactivate();
    expect(fleetVehicle.status).toBe('INACTIVE');
  });

  it('should create immutable CorporateCreditLedger entries', () => {
    const entry = new CorporateCreditLedger({
      corporateAccountId: 1,
      entryType: 'CREDIT_GRANTED',
      amountPaise: 1000000,
      balanceAfterPaise: 1000000,
      referenceNotes: 'Initial credit line',
    });

    expect(entry.entryType).toBe('CREDIT_GRANTED');
    expect(entry.amountPaise).toBe(1000000n);
    expect(entry.balanceAfterPaise).toBe(1000000n);
  });

  it('should manage CorporateInvoice state transitions and payments', () => {
    const invoice = new CorporateInvoice({
      invoiceNumber: 'INV-CORP-202608-1001',
      corporateAccountId: 1,
      billingPeriodStart: new Date('2026-08-01'),
      billingPeriodEnd: new Date('2026-08-31'),
      subtotalPaise: 100000, // 1000 INR
      cgstPaise: 9000,
      sgstPaise: 9000,
      igstPaise: 0,
      totalAmountPaise: 118000, // 1180 INR
      dueDate: new Date('2026-09-15'),
      lines: [
        {
          bookingId: 101,
          description: 'Booking #B101',
          amountPaise: 100000,
          taxRateBasis: 18.0,
        },
      ],
    });

    expect(invoice.status).toBe('DRAFT');
    invoice.issue();
    expect(invoice.status).toBe('ISSUED');

    invoice.recordPayment(50000);
    expect(invoice.status).toBe('PARTIALLY_PAID');
    expect(invoice.paidAmountPaise).toBe(50000n);

    invoice.recordPayment(68000);
    expect(invoice.status).toBe('PAID');
    expect(invoice.paidAmountPaise).toBe(118000n);
  });
});
