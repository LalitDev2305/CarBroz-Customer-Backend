/** Input contract for generating a Financials-owned corporate invoice. */
export interface GenerateCorporateInvoiceDto {
  accountPublicId: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
}

/** Input contract for reconciling an offline corporate payment. */
export interface ReconcileCorporatePaymentDto {
  invoicePublicId: string;
  paymentAmountPaise: number;
  referenceNotes?: string;
}
