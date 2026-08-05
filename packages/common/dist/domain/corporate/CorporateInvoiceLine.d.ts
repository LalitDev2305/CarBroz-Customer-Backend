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
export declare class CorporateInvoiceLine {
    id?: number;
    publicId?: string;
    corporateInvoiceId?: number;
    bookingId: number;
    description: string;
    amountPaise: bigint;
    taxRateBasis: number;
    createdAt?: Date;
    constructor(props: CorporateInvoiceLineProps);
}
