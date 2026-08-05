import { Money } from '../value-objects/Money.js';
export type CorporateAccountStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
export interface BillingAddressProps {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
export interface CorporateAccountProps {
    id?: number;
    publicId?: string;
    companyName: string;
    legalName: string;
    gstin: string;
    pan: string;
    billingAddress: BillingAddressProps;
    creditLimitPaise?: bigint | number;
    utilisedCreditPaise?: bigint | number;
    status?: CorporateAccountStatus;
    paymentTermsDays?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class CorporateAccount {
    id?: number;
    publicId?: string;
    companyName: string;
    legalName: string;
    gstin: string;
    pan: string;
    billingAddress: BillingAddressProps;
    creditLimitPaise: bigint;
    utilisedCreditPaise: bigint;
    status: CorporateAccountStatus;
    paymentTermsDays: number;
    createdAt?: Date;
    updatedAt?: Date;
    constructor(props: CorporateAccountProps);
    get availableCredit(): Money;
    approve(initialCreditLimit: Money): void;
    suspend(reason: string): void;
    adjustCreditLimit(newLimit: Money): void;
    canCoverAmount(amount: Money): boolean;
}
