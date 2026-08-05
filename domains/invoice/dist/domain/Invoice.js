export class Invoice {
    id;
    publicId;
    bookingId;
    invoiceNumber;
    status;
    amountPaise;
    currency;
    documentJson;
    issuedAt;
    createdAt;
    updatedAt;
    constructor(props) {
        if (!props.bookingId)
            throw new Error('Invoice must be associated with a booking');
        if (!props.invoiceNumber)
            throw new Error('Invoice number is required');
        if (!Number.isInteger(props.amountPaise) || props.amountPaise <= 0) {
            throw new Error('Invoice amount must be a positive integer in paise');
        }
        this.id = props.id;
        this.publicId = props.publicId;
        this.bookingId = props.bookingId;
        this.invoiceNumber = props.invoiceNumber;
        this.status = props.status ?? 'ISSUED';
        this.amountPaise = props.amountPaise;
        this.currency = props.currency ?? 'INR';
        this.documentJson = props.documentJson;
        this.issuedAt = props.issuedAt ?? new Date();
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}
//# sourceMappingURL=Invoice.js.map