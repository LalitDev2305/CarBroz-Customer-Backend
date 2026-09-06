import { ICorporateAccountRepository } from '../domain/repositories/ICorporateAccountRepository.js';
import { ICorporateInvoiceRepository } from '../domain/repositories/ICorporateInvoiceRepository.js';
import { ICorporateCreditLedgerRepository } from '../domain/repositories/ICorporateCreditLedgerRepository.js';
import { CorporateCreditLedger } from '../domain/CorporateCreditLedger.js';
import { AuditLogService } from '@carbroz/domain-audit';
import { ReconcileCorporatePaymentDto } from '../dtos/corporate.dto.js';

/** ReconcileCorporatePaymentUseCase is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export class ReconcileCorporatePaymentUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly corporateInvoiceRepo: ICorporateInvoiceRepository,
    private readonly creditLedgerRepo: ICorporateCreditLedgerRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(dto: ReconcileCorporatePaymentDto, adminUserId: number) {
    const invoice = await this.corporateInvoiceRepo.findByPublicId(dto.invoicePublicId);
    if (!invoice) {
      throw new Error(`Corporate invoice not found with publicId: ${dto.invoicePublicId}`);
    }

    const account = await this.corporateAccountRepo.findById(invoice.corporateAccountId);
    if (!account) {
      throw new Error('Corporate account associated with invoice not found');
    }

    const paymentAmountBigInt = BigInt(dto.paymentAmountPaise);
    invoice.recordPayment(paymentAmountBigInt);
    const updatedInvoice = await this.corporateInvoiceRepo.update(invoice);

    const updatedAccount = await this.corporateAccountRepo.updateUtilisedCredit(
      account.id!,
      -paymentAmountBigInt
    );

    const ledgerEntry = new CorporateCreditLedger({
      corporateAccountId: account.id!,
      invoiceId: invoice.id!,
      entryType: 'PAYMENT_CREDIT',
      amountPaise: paymentAmountBigInt,
      balanceAfterPaise: updatedAccount.creditLimitPaise - updatedAccount.utilisedCreditPaise,
      referenceNotes: dto.referenceNotes ?? `B2B Bank Payment reconciled against Invoice ${invoice.invoiceNumber}`,
    });
    await this.creditLedgerRepo.create(ledgerEntry);

    await this.auditLogService.log({
      actorId: adminUserId,
      actorType: 'ADMIN',
      action: 'CORPORATE_PAYMENT_RECONCILE',
      resource: 'CorporateInvoice',
      resourcePublicId: updatedInvoice.publicId,
      oldValue: { paidAmountPaise: Number(invoice.paidAmountPaise - paymentAmountBigInt) },
      newValue: { paidAmountPaise: Number(updatedInvoice.paidAmountPaise), status: updatedInvoice.status },
    });

    return updatedInvoice;
  }
}
