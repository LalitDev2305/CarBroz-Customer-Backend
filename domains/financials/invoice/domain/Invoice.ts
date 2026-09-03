import { type InvoiceStatus } from './InvoiceStatus.js';

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
    if (!Number.isInteger(props.amountPaise) || props.amountPaise <= 0) {
      throw new Error('Invoice amount must be a positive integer in paise');
    }

    if (props.id !== undefined) this.id = props.id;
    if (props.publicId !== undefined) this.publicId = props.publicId;
    this.bookingId = props.bookingId;
    this.invoiceNumber = props.invoiceNumber;
    this.status = props.status ?? 'ISSUED';
    this.amountPaise = props.amountPaise;
    this.currency = props.currency ?? 'INR';
    this.documentJson = props.documentJson;
    this.issuedAt = props.issuedAt ?? new Date();
    if (props.createdAt !== undefined) this.createdAt = props.createdAt;
    if (props.updatedAt !== undefined) this.updatedAt = props.updatedAt;
  }
}
