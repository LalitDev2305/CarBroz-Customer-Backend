export class CorporateInvoiceLine {
    id;
    publicId;
    corporateInvoiceId;
    bookingId;
    description;
    amountPaise;
    taxRateBasis;
    createdAt;
    constructor(props) {
        if (!props.bookingId)
            throw new Error('Invoice line requires bookingId');
        if (!props.description)
            throw new Error('Invoice line requires description');
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
//# sourceMappingURL=CorporateInvoiceLine.js.map