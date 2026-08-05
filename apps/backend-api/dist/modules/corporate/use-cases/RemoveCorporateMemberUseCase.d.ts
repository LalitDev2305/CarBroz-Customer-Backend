import { ICorporateAccountRepository, ICorporateMemberRepository, AuditLogService } from '@carbroz/common';
import { RemoveCorporateMemberDto } from '../dtos/corporate.dto.js';
export declare class RemoveCorporateMemberUseCase {
    private readonly corporateAccountRepo;
    private readonly corporateMemberRepo;
    private readonly auditLogService;
    constructor(corporateAccountRepo: ICorporateAccountRepository, corporateMemberRepo: ICorporateMemberRepository, auditLogService: AuditLogService);
    execute(dto: RemoveCorporateMemberDto, actorUserId: number): Promise<void>;
}
