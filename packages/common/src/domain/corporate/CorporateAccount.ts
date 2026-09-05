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

export class CorporateAccount {
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

  constructor(props: CorporateAccountProps) {
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

  get availableCredit(): Money {
    const available = this.creditLimitPaise - this.utilisedCreditPaise;
    return Money.fromMinor(Number(available > 0n ? available : 0n));
  }

  approve(initialCreditLimit: Money): void {
    if (this.status !== 'PENDING_APPROVAL') {
      throw new Error(`Cannot approve corporate account in status ${this.status}`);
    }
    this.creditLimitPaise = BigInt(initialCreditLimit.amountMinor);
    this.status = 'ACTIVE';
  }

  suspend(reason: string): void {
    void reason;
    if (this.status === 'CLOSED') {
      throw new Error('Cannot suspend a closed corporate account');
    }
    this.status = 'SUSPENDED';
  }

  adjustCreditLimit(newLimit: Money): void {
    if (this.status === 'CLOSED') {
      throw new Error('Cannot adjust credit limit of a closed corporate account');
    }
    this.creditLimitPaise = BigInt(newLimit.amountMinor);
  }

  canCoverAmount(amount: Money): boolean {
    if (this.status !== 'ACTIVE') return false;
    const required = BigInt(amount.amountMinor);
    return (this.utilisedCreditPaise + required) <= this.creditLimitPaise;
  }
}
