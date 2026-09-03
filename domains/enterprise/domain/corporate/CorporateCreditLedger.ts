export type CorporateLedgerEntryType =
  | 'CREDIT_GRANTED'
  | 'BOOKING_DEBIT'
  | 'BOOKING_REFUND_CREDIT'
  | 'PAYMENT_CREDIT'
  | 'ADJUSTMENT';

export interface CorporateCreditLedgerProps {
  id?: number;
  publicId?: string;
  corporateAccountId: number;
  bookingId?: number | null;
  invoiceId?: number | null;
  entryType: CorporateLedgerEntryType;
  amountPaise: bigint | number;
  balanceAfterPaise: bigint | number;
  referenceNotes?: string | null;
  createdAt?: Date;
}

export class CorporateCreditLedger {
  id?: number;
  publicId?: string;
  corporateAccountId: number;
  bookingId: number | null;
  invoiceId: number | null;
  entryType: CorporateLedgerEntryType;
  amountPaise: bigint;
  balanceAfterPaise: bigint;
  referenceNotes: string | null;
  createdAt?: Date;

  constructor(props: CorporateCreditLedgerProps) {
    if (!props.corporateAccountId) throw new Error('Ledger entry requires corporateAccountId');
    if (!props.entryType) throw new Error('Ledger entry requires entryType');

    if (props.id !== undefined) this.id = props.id;
    if (props.publicId !== undefined) this.publicId = props.publicId;
    this.corporateAccountId = props.corporateAccountId;
    this.bookingId = props.bookingId ?? null;
    this.invoiceId = props.invoiceId ?? null;
    this.entryType = props.entryType;
    this.amountPaise = BigInt(props.amountPaise);
    this.balanceAfterPaise = BigInt(props.balanceAfterPaise);
    this.referenceNotes = props.referenceNotes ?? null;
    if (props.createdAt !== undefined) this.createdAt = props.createdAt;
  }
}
