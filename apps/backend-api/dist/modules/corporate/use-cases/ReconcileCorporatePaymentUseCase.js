import { CorporateCreditLedger, } from '@carbroz/common';
export class ReconcileCorporatePaymentUseCase {
    corporateAccountRepo;
    corporateInvoiceRepo;
    creditLedgerRepo;
    auditLogService;
    constructor(corporateAccountRepo, corporateInvoiceRepo, creditLedgerRepo, auditLogService) {
        this.corporateAccountRepo = corporateAccountRepo;
        this.corporateInvoiceRepo = corporateInvoiceRepo;
        this.creditLedgerRepo = creditLedgerRepo;
        this.auditLogService = auditLogService;
    }
    async execute(dto, adminUserId) {
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
        const updatedAccount = await this.corporateAccountRepo.updateUtilisedCredit(account.id, -paymentAmountBigInt);
        const ledgerEntry = new CorporateCreditLedger({
            corporateAccountId: account.id,
            invoiceId: invoice.id,
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
//# sourceMappingURL=ReconcileCorporatePaymentUseCase.js.map