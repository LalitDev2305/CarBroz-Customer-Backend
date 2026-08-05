export interface CorporateInvoiceLineProps {
  id?: number;
  publicId?: string;
  corporateInvoiceId?: number;
  bookingId: number;
  description: string;
  amountPaise: bigint | number;
  taxRateBasis: number;
  createdAt?: Date;
}

export class CorporateInvoiceLine {
  id?: number;
  publicId?: string;
  corporateInvoiceId?: number;
  bookingId: number;
  description: string;
  amountPaise: bigint;
  taxRateBasis: number;
  createdAt?: Date;

  constructor(props: CorporateInvoiceLineProps) {
    if (!props.bookingId) throw new Error('Invoice line requires bookingId');
    if (!props.description) throw new Error('Invoice line requires description');

    this.id = props.id;
    this.publicId = props.publicId;
    this.corporateInvoiceId = props.corporateInvoiceId;
    this.bookingId = props.bookingId;
    this.description = props.description;
    this.amountPaise = BigInt(props.amountPaise);
    this.taxRateBasis = props.taxRateBasis;
    this.createdAt = props.createdAt;
  }
}
