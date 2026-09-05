import { Money } from '@carbroz/foundation-kernel';
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

    const gross = Money.fromMinor(props.grossAmountPaise);
    const commission = Money.fromMinor(props.commissionPaise);
    const tds = Money.fromMinor(props.tdsPaise);
    const net = Money.fromMinor(props.netPayoutPaise);
    const expectedNet = gross.subtract(commission.add(tds));

    if (!expectedNet.equals(net)) {
      throw new Error('Payout net amount must equal gross amount minus commission and TDS');
    }

    const calculationGross = Money.fromMinor(props.calculationJson.grossAmountPaise);
    const calculationCommission = Money.fromMinor(props.calculationJson.commissionPaise);
    const calculationTds = Money.fromMinor(props.calculationJson.tdsPaise);
    const calculationNet = Money.fromMinor(props.calculationJson.netPayoutPaise);
    if (
      !gross.equals(calculationGross) ||
      !commission.equals(calculationCommission) ||
      !tds.equals(calculationTds) ||
      !net.equals(calculationNet)
    ) {
      throw new Error('Payout amounts must match the persisted calculation snapshot');
    }

    this.id = props.id;
    this.publicId = props.publicId;
    this.bookingId = props.bookingId;
    this.partnerId = props.partnerId;
    this.status = props.status ?? 'SCHEDULED';
    this.grossAmountPaise = gross.amountMinor;
    this.commissionPaise = commission.amountMinor;
    this.tdsPaise = tds.amountMinor;
    this.netPayoutPaise = net.amountMinor;
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
