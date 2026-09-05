import { Money } from '@carbroz/foundation-kernel';
import { InvoiceStatus } from './InvoiceStatus.js';

export interface InvoiceDocument {
  invoiceNumber: string;
  bookingPublicId: string;
  customerName?: string;
  customerAddress?: string;
  sellerGstin?: string;
  serviceName: string;
  basePricePaise: number;
  addonsTotalPaise: number;
  subtotalPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalTaxPaise: number;
  totalPricePaise: number;
  currency: string;
  issuedAt: Date | string;
}

export interface InvoiceProps {
  id?: number;
  publicId?: string;
  bookingId: number;
  invoiceNumber: string;
  status?: InvoiceStatus;
  amountPaise: number;
  currency?: string;
  documentJson: InvoiceDocument;
  issuedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Invoice {
  id?: number;
  publicId?: string;
  bookingId: number;
  invoiceNumber: string;
  status: InvoiceStatus;
  amountPaise: number;
  currency: string;
  documentJson: InvoiceDocument;
  issuedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: InvoiceProps) {
    if (!props.bookingId) throw new Error('Invoice must be associated with a booking');
    if (!props.invoiceNumber) throw new Error('Invoice number is required');

    const amount = Money.fromMinor(props.amountPaise, props.currency ?? 'INR');
    if (amount.amountMinor <= 0) {
      throw new Error('Invoice amount must be a positive integer in minor units');
    }

    const documentTotal = Money.fromMinor(props.documentJson.totalPricePaise, props.documentJson.currency);
    if (!amount.equals(documentTotal)) {
      throw new Error('Invoice amount must match the document total');
    }

    this.id = props.id;
    this.publicId = props.publicId;
    this.bookingId = props.bookingId;
    this.invoiceNumber = props.invoiceNumber;
    this.status = props.status ?? 'ISSUED';
    this.amountPaise = amount.amountMinor;
    this.currency = amount.currency;
    this.documentJson = props.documentJson;
    this.issuedAt = props.issuedAt ?? new Date();
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get money(): Money {
    return Money.fromMinor(this.amountPaise, this.currency);
  }
}
