export type CorporateLedgerEntryType = 'CREDIT_GRANTED' | 'BOOKING_DEBIT' | 'BOOKING_REFUND_CREDIT' | 'PAYMENT_CREDIT' | 'ADJUSTMENT';
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
export declare class CorporateCreditLedger {
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
    constructor(props: CorporateCreditLedgerProps);
}
