export class CorporateCreditLedger {
    id;
    publicId;
    corporateAccountId;
    bookingId;
    invoiceId;
    entryType;
    amountPaise;
    balanceAfterPaise;
    referenceNotes;
    createdAt;
    constructor(props) {
        if (!props.corporateAccountId)
            throw new Error('Ledger entry requires corporateAccountId');
        if (!props.entryType)
            throw new Error('Ledger entry requires entryType');
        this.id = props.id;
        this.publicId = props.publicId;
        this.corporateAccountId = props.corporateAccountId;
        this.bookingId = props.bookingId ?? null;
        this.invoiceId = props.invoiceId ?? null;
        this.entryType = props.entryType;
        this.amountPaise = BigInt(props.amountPaise);
        this.balanceAfterPaise = BigInt(props.balanceAfterPaise);
        this.referenceNotes = props.referenceNotes ?? null;
        this.createdAt = props.createdAt;
    }
}
//# sourceMappingURL=CorporateCreditLedger.js.map