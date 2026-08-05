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
export declare class Invoice {
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
    constructor(props: InvoiceProps);
}
//# sourceMappingURL=Invoice.d.ts.map