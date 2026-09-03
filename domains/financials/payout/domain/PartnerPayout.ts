import { PayoutStatus } from './PayoutStatus.js';

export interface PayoutCalculation {
  grossAmountPaise: number;
  commissionPercentage: number;
  commissionPaise: number;
  tdsPercentage: number;
  tdsPaise: number;
  netPayoutPaise: number;
  appliedRules: string[];
}

export interface PartnerPayoutProps {
  id?: number;
  publicId?: string;
  bookingId: number;
  partnerId: number;
  status?: PayoutStatus;
  grossAmountPaise: number;
  commissionPaise: number;
  tdsPaise: number;
  netPayoutPaise: number;
  calculationJson: PayoutCalculation;
  scheduledAt?: Date;
  paidAt?: Date | null;
  externalReference?: string | null;
  failureReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PartnerPayout {
  id?: number;
  publicId?: string;
  bookingId: number;
  partnerId: number;
  status: PayoutStatus;
  grossAmountPaise: number;
  commissionPaise: number;
  tdsPaise: number;
  netPayoutPaise: number;
  calculationJson: PayoutCalculation;
  scheduledAt: Date;
  paidAt: Date | null;
  externalReference: string | null;
  failureReason: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: PartnerPayoutProps) {
    if (!props.bookingId) throw new Error('Payout must be associated with a booking');
    if (!props.partnerId) throw new Error('Payout must be associated with a partner');

    this.id = props.id;
    this.publicId = props.publicId;
    this.bookingId = props.bookingId;
    this.partnerId = props.partnerId;
    this.status = props.status ?? 'SCHEDULED';
    this.grossAmountPaise = props.grossAmountPaise;
    this.commissionPaise = props.commissionPaise;
    this.tdsPaise = props.tdsPaise;
    this.netPayoutPaise = props.netPayoutPaise;
    this.calculationJson = props.calculationJson;
    this.scheduledAt = props.scheduledAt ?? new Date();
    this.paidAt = props.paidAt ?? null;
    this.externalReference = props.externalReference ?? null;
    this.failureReason = props.failureReason ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  approve(): void {
    if (this.status !== 'SCHEDULED') {
      throw new Error(`Cannot approve payout in status ${this.status}`);
    }
    this.status = 'APPROVED';
  }

  markProcessing(): void {
    if (this.status !== 'APPROVED' && this.status !== 'SCHEDULED') {
      throw new Error(`Cannot start processing payout in status ${this.status}`);
    }
    this.status = 'PROCESSING';
  }

  markPaid(externalReference: string): void {
    if (this.status === 'PAID') return;
    this.status = 'PAID';
    this.paidAt = new Date();
    this.externalReference = externalReference;
  }

  markFailed(reason: string): void {
    this.status = 'FAILED';
    this.failureReason = reason;
  }
}
