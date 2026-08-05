import { CorporateInvoiceLine } from './CorporateInvoiceLine.js';
export class CorporateInvoice {
    id;
    publicId;
    invoiceNumber;
    corporateAccountId;
    billingPeriodStart;
    billingPeriodEnd;
    subtotalPaise;
    cgstPaise;
    sgstPaise;
    igstPaise;
    totalAmountPaise;
    paidAmountPaise;
    dueDate;
    status;
    lines;
    createdAt;
    updatedAt;
    constructor(props) {
        if (!props.invoiceNumber)
            throw new Error('Corporate invoice requires invoiceNumber');
        if (!props.corporateAccountId)
            throw new Error('Corporate invoice requires corporateAccountId');
        this.id = props.id;
        this.publicId = props.publicId;
        this.invoiceNumber = props.invoiceNumber;
        this.corporateAccountId = props.corporateAccountId;
        this.billingPeriodStart = props.billingPeriodStart;
        this.billingPeriodEnd = props.billingPeriodEnd;
        this.subtotalPaise = BigInt(props.subtotalPaise);
        this.cgstPaise = BigInt(props.cgstPaise ?? 0);
        this.sgstPaise = BigInt(props.sgstPaise ?? 0);
        this.igstPaise = BigInt(props.igstPaise ?? 0);
        this.totalAmountPaise = BigInt(props.totalAmountPaise);
        this.paidAmountPaise = BigInt(props.paidAmountPaise ?? 0);
        this.dueDate = props.dueDate;
        this.status = props.status ?? 'DRAFT';
        this.lines = (props.lines ?? []).map((l) => new CorporateInvoiceLine(l));
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    issue() {
        if (this.status !== 'DRAFT') {
            throw new Error(`Cannot issue invoice in status ${this.status}`);
        }
        this.status = 'ISSUED';
    }
    recordPayment(amountPaise) {
        const payment = BigInt(amountPaise);
        this.paidAmountPaise += payment;
        if (this.paidAmountPaise >= this.totalAmountPaise) {
            this.status = 'PAID';
        }
        else if (this.paidAmountPaise > 0n) {
            this.status = 'PARTIALLY_PAID';
        }
    }
    markOverdue() {
        if (this.status === 'ISSUED' || this.status === 'PARTIALLY_PAID') {
            if (new Date() > this.dueDate) {
                this.status = 'OVERDUE';
            }
        }
    }
}
//# sourceMappingURL=CorporateInvoice.js.map