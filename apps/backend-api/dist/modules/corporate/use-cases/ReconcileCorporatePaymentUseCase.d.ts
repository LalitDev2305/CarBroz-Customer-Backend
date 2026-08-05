import { ICorporateAccountRepository, ICorporateInvoiceRepository, ICorporateCreditLedgerRepository, AuditLogService } from '@carbroz/common';
import { ReconcileCorporatePaymentDto } from '../dtos/corporate.dto.js';
export declare class ReconcileCorporatePaymentUseCase {
    private readonly corporateAccountRepo;
    private readonly corporateInvoiceRepo;
    private readonly creditLedgerRepo;
    private readonly auditLogService;
    constructor(corporateAccountRepo: ICorporateAccountRepository, corporateInvoiceRepo: ICorporateInvoiceRepository, creditLedgerRepo: ICorporateCreditLedgerRepository, auditLogService: AuditLogService);
    execute(dto: ReconcileCorporatePaymentDto, adminUserId: number): Promise<import("@carbroz/common").CorporateInvoice>;
}
