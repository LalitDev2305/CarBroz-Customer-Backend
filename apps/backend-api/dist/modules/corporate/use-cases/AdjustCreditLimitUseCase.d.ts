import { ICorporateAccountRepository, ICorporateCreditLedgerRepository, AuditLogService } from '@carbroz/common';
import { AdjustCreditLimitDto } from '../dtos/corporate.dto.js';
export declare class AdjustCreditLimitUseCase {
    private readonly corporateAccountRepo;
    private readonly creditLedgerRepo;
    private readonly auditLogService;
    constructor(corporateAccountRepo: ICorporateAccountRepository, creditLedgerRepo: ICorporateCreditLedgerRepository, auditLogService: AuditLogService);
    execute(dto: AdjustCreditLimitDto, adminUserId: number): Promise<import("@carbroz/common").CorporateAccount>;
}
