import { PayoutStatus } from '../enums/PayoutStatus.js';
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
export declare class PartnerPayout {
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
    constructor(props: PartnerPayoutProps);
    approve(): void;
    markProcessing(): void;
    markPaid(externalReference: string): void;
    markFailed(reason: string): void;
}
