import { ICorporateAccountRepository, ICorporateCreditLedgerRepository, AuditLogService } from '@carbroz/common';
import { ApproveCorporateAccountDto } from '../dtos/corporate.dto.js';
export declare class ApproveCorporateAccountUseCase {
    private readonly corporateAccountRepo;
    private readonly creditLedgerRepo;
    private readonly auditLogService;
    constructor(corporateAccountRepo: ICorporateAccountRepository, creditLedgerRepo: ICorporateCreditLedgerRepository, auditLogService: AuditLogService);
    execute(dto: ApproveCorporateAccountDto, adminUserId: number): Promise<import("@carbroz/common").CorporateAccount>;
}
