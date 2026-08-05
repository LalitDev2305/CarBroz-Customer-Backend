import { BillingAddressProps, CorporateMemberRole } from '@carbroz/common';
export interface RegisterCorporateAccountDto {
    companyName: string;
    legalName: string;
    gstin: string;
    pan: string;
    billingAddress: BillingAddressProps;
    paymentTermsDays?: number;
}
export interface ApproveCorporateAccountDto {
    accountPublicId: string;
    initialCreditLimitPaise: number;
}
export interface AdjustCreditLimitDto {
    accountPublicId: string;
    newCreditLimitPaise: number;
    reason?: string;
}
export interface AddCorporateMemberDto {
    accountPublicId: string;
    userEmail: string;
    role: CorporateMemberRole;
    monthlyCapPaise?: number;
}
export interface RemoveCorporateMemberDto {
    accountPublicId: string;
    memberPublicId: string;
}
export interface EnrollFleetVehicleDto {
    accountPublicId: string;
    registrationNumber: string;
    department?: string;
    costCenter?: string;
    monthlyCapPaise?: number;
}
export interface RemoveFleetVehicleDto {
    accountPublicId: string;
    fleetVehiclePublicId: string;
}
export interface ValidateCorporateBookingDto {
    userPublicId: string;
    vehiclePublicId: string;
    bookingAmountPaise: number;
}
export interface GenerateCorporateInvoiceDto {
    accountPublicId: string;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    dueDate: string;
}
export interface ReconcileCorporatePaymentDto {
    invoicePublicId: string;
    paymentAmountPaise: number;
    referenceNotes?: string;
}
