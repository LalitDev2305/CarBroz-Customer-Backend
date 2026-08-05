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
export declare class CorporateInvoice {
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
    constructor(props: CorporateInvoiceProps);
    issue(): void;
    recordPayment(amountPaise: bigint | number): void;
    markOverdue(): void;
}
