import { DomainError, systemClock } from "@carbroz/foundation-kernel";
import { Money } from "@carbroz/foundation-kernel";
import { InvoiceStatus } from "./InvoiceStatus.js";

/** InvoiceDocument is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
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

/** InvoiceProps is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
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

/** Invoice is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
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
    if (!props.bookingId)
      throw new DomainError("Invoice must be associated with a booking");
    if (!props.invoiceNumber)
      throw new DomainError("Invoice number is required");

    const amount = Money.fromMinor(props.amountPaise, props.currency ?? "INR");
    if (amount.amountMinor <= 0) {
      throw new DomainError(
        "Invoice amount must be a positive integer in minor units",
      );
    }

    const documentTotal = Money.fromMinor(
      props.documentJson.totalPricePaise,
      props.documentJson.currency,
    );
    if (!amount.equals(documentTotal)) {
      throw new DomainError("Invoice amount must match the document total");
    }

    this.id = props.id;
    this.publicId = props.publicId;
    this.bookingId = props.bookingId;
    this.invoiceNumber = props.invoiceNumber;
    this.status = props.status ?? "ISSUED";
    this.amountPaise = amount.amountMinor;
    this.currency = amount.currency;
    this.documentJson = props.documentJson;
    this.issuedAt = props.issuedAt ?? systemClock.now();
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get money(): Money {
    return Money.fromMinor(this.amountPaise, this.currency);
  }
}
