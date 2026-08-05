import { Money } from '../value-objects/Money.js';
export class CorporateAccount {
    id;
    publicId;
    companyName;
    legalName;
    gstin;
    pan;
    billingAddress;
    creditLimitPaise;
    utilisedCreditPaise;
    status;
    paymentTermsDays;
    createdAt;
    updatedAt;
    constructor(props) {
        if (!props.companyName || props.companyName.trim() === '') {
            throw new Error('Company name is required');
        }
        if (!props.gstin || props.gstin.trim() === '') {
            throw new Error('GSTIN is required');
        }
        this.id = props.id;
        this.publicId = props.publicId;
        this.companyName = props.companyName;
        this.legalName = props.legalName;
        this.gstin = props.gstin.trim().toUpperCase();
        this.pan = props.pan;
        this.billingAddress = props.billingAddress;
        this.creditLimitPaise = BigInt(props.creditLimitPaise ?? 0);
        this.utilisedCreditPaise = BigInt(props.utilisedCreditPaise ?? 0);
        this.status = props.status ?? 'PENDING_APPROVAL';
        this.paymentTermsDays = props.paymentTermsDays ?? 30;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    get availableCredit() {
        const available = this.creditLimitPaise - this.utilisedCreditPaise;
        return Money.fromPaise(Number(available > 0n ? available : 0n));
    }
    approve(initialCreditLimit) {
        if (this.status !== 'PENDING_APPROVAL') {
            throw new Error(`Cannot approve corporate account in status ${this.status}`);
        }
        this.creditLimitPaise = BigInt(initialCreditLimit.amountPaise);
        this.status = 'ACTIVE';
    }
    suspend(reason) {
        if (this.status === 'CLOSED') {
            throw new Error('Cannot suspend a closed corporate account');
        }
        this.status = 'SUSPENDED';
    }
    adjustCreditLimit(newLimit) {
        if (this.status === 'CLOSED') {
            throw new Error('Cannot adjust credit limit of a closed corporate account');
        }
        this.creditLimitPaise = BigInt(newLimit.amountPaise);
    }
    canCoverAmount(amount) {
        if (this.status !== 'ACTIVE')
            return false;
        const required = BigInt(amount.amountPaise);
        return (this.utilisedCreditPaise + required) <= this.creditLimitPaise;
    }
}
//# sourceMappingURL=CorporateAccount.js.map