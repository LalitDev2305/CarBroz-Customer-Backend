import { CorporateInvoiceLine, CorporateInvoiceLineProps } from './CorporateInvoiceLine.js';

export type CorporateInvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';

export interface CorporateInvoiceProps {
  id?: number;
  publicId?: string;
  invoiceNumber: string;
  corporateAccountId: number;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  subtotalPaise: bigint | number;
  cgstPaise?: bigint | number;
  sgstPaise?: bigint | number;
  igstPaise?: bigint | number;
  totalAmountPaise: bigint | number;
  paidAmountPaise?: bigint | number;
  dueDate: Date;
  status?: CorporateInvoiceStatus;
  lines?: CorporateInvoiceLineProps[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class CorporateInvoice {
  id?: number;
  publicId?: string;
  invoiceNumber: string;
  corporateAccountId: number;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  subtotalPaise: bigint;
  cgstPaise: bigint;
  sgstPaise: bigint;
  igstPaise: bigint;
  totalAmountPaise: bigint;
  paidAmountPaise: bigint;
  dueDate: Date;
  status: CorporateInvoiceStatus;
  lines: CorporateInvoiceLine[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: CorporateInvoiceProps) {
    if (!props.invoiceNumber) throw new Error('Corporate invoice requires invoiceNumber');
    if (!props.corporateAccountId) throw new Error('Corporate invoice requires corporateAccountId');

    this.id = props.id;
    this.publicId = props.publicId;
    this.invoiceNumber = props.invoiceNumber;
    this.corporateAccountId = props.corporateAccountId;
    this.billingPeriodStart = props.billingPeriodStart;
    this.billingPeriodEnd = props.billingPeriodEnd;
    this.subtotalPaise = BigInt(props.subtotalPaise);
    this.cgstPaise = BigInt(props.cgstPaise ?? 0);
    this.sgstPaise = BigInt(props.sgstPaise ?? 0);
    this.igstPaise = BigInt(props.igstPaise ?? 0);
    this.totalAmountPaise = BigInt(props.totalAmountPaise);
    this.paidAmountPaise = BigInt(props.paidAmountPaise ?? 0);
    this.dueDate = props.dueDate;
    this.status = props.status ?? 'DRAFT';
    this.lines = (props.lines ?? []).map((l) => new CorporateInvoiceLine(l));
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  issue(): void {
    if (this.status !== 'DRAFT') {
      throw new Error(`Cannot issue invoice in status ${this.status}`);
    }
    this.status = 'ISSUED';
  }

  recordPayment(amountPaise: bigint | number): void {
    const payment = BigInt(amountPaise);
    this.paidAmountPaise += payment;

    if (this.paidAmountPaise >= this.totalAmountPaise) {
      this.status = 'PAID';
    } else if (this.paidAmountPaise > 0n) {
      this.status = 'PARTIALLY_PAID';
    }
  }

  markOverdue(): void {
    if (this.status === 'ISSUED' || this.status === 'PARTIALLY_PAID') {
      if (new Date() > this.dueDate) {
        this.status = 'OVERDUE';
      }
    }
  }
}
