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

    if (props.id !== undefined) this.id = props.id;
    if (props.publicId !== undefined) this.publicId = props.publicId;
    if (props.corporateInvoiceId !== undefined) this.corporateInvoiceId = props.corporateInvoiceId;
    this.bookingId = props.bookingId;
    this.description = props.description;
    this.amountPaise = BigInt(props.amountPaise);
    this.taxRateBasis = props.taxRateBasis;
    if (props.createdAt !== undefined) this.createdAt = props.createdAt;
  }
}
