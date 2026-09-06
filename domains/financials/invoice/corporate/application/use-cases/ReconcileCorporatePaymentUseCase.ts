import { DomainError } from "@carbroz/foundation-kernel";
import type { ICorporateCreditAccounting } from "../../../../ledger/corporate/application/ports/CorporateCreditAccountingPorts.js";
import type { ICorporateInvoiceRepository } from "../../domain/repositories/ICorporateInvoiceRepository.js";
import type { ReconcileCorporatePaymentDto } from "../dto/corporate-invoice.dto.js";
import type { FinancialAuditLogPort } from "../ports/CorporateBillingPorts.js";

/** Reconciles corporate invoice payments while Financials owns all accounting side effects. */
export class ReconcileCorporatePaymentUseCase {
  constructor(
    private readonly corporateInvoiceRepo: ICorporateInvoiceRepository,
    private readonly corporateCreditAccounting: ICorporateCreditAccounting,
    private readonly auditLogService: FinancialAuditLogPort,
  ) {}

  async execute(dto: ReconcileCorporatePaymentDto, adminUserId: number) {
    const invoice = await this.corporateInvoiceRepo.findByPublicId(
      dto.invoicePublicId,
    );
    if (!invoice) {
      throw new DomainError(
        `Corporate invoice not found with publicId: ${dto.invoicePublicId}`,
      );
    }
    if (!invoice.id)
      throw new DomainError(
        "Corporate invoice must be persisted before payment reconciliation",
      );

    const paymentAmountPaise = BigInt(dto.paymentAmountPaise);
    if (paymentAmountPaise <= 0n)
      throw new DomainError("Corporate payment amount must be positive");
    const remainingAmountPaise =
      invoice.totalAmountPaise - invoice.paidAmountPaise;
    if (paymentAmountPaise > remainingAmountPaise) {
      throw new DomainError("Corporate payment amount exceeds invoice balance");
    }

    const previousPaidAmountPaise = invoice.paidAmountPaise;
    invoice.recordPayment(paymentAmountPaise);
    const updatedInvoice = await this.corporateInvoiceRepo.update(invoice);

    await this.corporateCreditAccounting.recordPaymentCredit({
      corporateAccountId: invoice.corporateAccountId,
      invoiceId: invoice.id,
      amountPaise: paymentAmountPaise,
      referenceNotes:
        dto.referenceNotes ??
        `B2B Bank Payment reconciled against Invoice ${invoice.invoiceNumber}`,
    });

    await this.auditLogService.log({
      actorId: adminUserId,
      actorType: "ADMIN",
      action: "CORPORATE_PAYMENT_RECONCILE",
      resource: "CorporateInvoice",
      resourcePublicId: updatedInvoice.publicId,
      oldValue: { paidAmountPaise: Number(previousPaidAmountPaise) },
      newValue: {
        paidAmountPaise: Number(updatedInvoice.paidAmountPaise),
        status: updatedInvoice.status,
      },
    });

    return updatedInvoice;
  }
}
