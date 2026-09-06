import { BillingAddressProps, CorporateAccountStatus } from '../domain/CorporateAccount.js';
import { CorporateMemberRole } from '../domain/CorporateMember.js';
import { CorporateInvoiceStatus } from '../domain/CorporateInvoice.js';
/** RegisterCorporateAccountDto is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export interface RegisterCorporateAccountDto {
  companyName: string;
  legalName: string;
  gstin: string;
  pan: string;
  billingAddress: BillingAddressProps;
  paymentTermsDays?: number;
}

/** ApproveCorporateAccountDto is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ApproveCorporateAccountDto {
  accountPublicId: string;
  initialCreditLimitPaise: number;
}

/** AdjustCreditLimitDto is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export interface AdjustCreditLimitDto {
  accountPublicId: string;
  newCreditLimitPaise: number;
  reason?: string;
}

/** AddCorporateMemberDto is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export interface AddCorporateMemberDto {
  accountPublicId: string;
  userEmail: string;
  role: CorporateMemberRole;
  monthlyCapPaise?: number;
}

/** RemoveCorporateMemberDto is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export interface RemoveCorporateMemberDto {
  accountPublicId: string;
  memberPublicId: string;
}

/** EnrollFleetVehicleDto is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export interface EnrollFleetVehicleDto {
  accountPublicId: string;
  registrationNumber: string;
  department?: string;
  costCenter?: string;
  monthlyCapPaise?: number;
}

/** RemoveFleetVehicleDto is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export interface RemoveFleetVehicleDto {
  accountPublicId: string;
  fleetVehiclePublicId: string;
}

/** ValidateCorporateBookingDto is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ValidateCorporateBookingDto {
  userPublicId: string;
  vehiclePublicId: string;
  bookingAmountPaise: number;
}

/** GenerateCorporateInvoiceDto is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export interface GenerateCorporateInvoiceDto {
  accountPublicId: string;
  billingPeriodStart: string; // ISO date
  billingPeriodEnd: string; // ISO date
  dueDate: string; // ISO date
}

/** ReconcileCorporatePaymentDto is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ReconcileCorporatePaymentDto {
  invoicePublicId: string;
  paymentAmountPaise: number;
  referenceNotes?: string;
}
