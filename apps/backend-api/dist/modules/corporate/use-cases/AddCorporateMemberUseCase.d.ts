import { ICorporateAccountRepository, ICorporateMemberRepository, IUserRepository, CorporateMember, AuditLogService } from '@carbroz/common';
import { AddCorporateMemberDto } from '../dtos/corporate.dto.js';
export declare class AddCorporateMemberUseCase {
    private readonly corporateAccountRepo;
    private readonly corporateMemberRepo;
    private readonly userRepository;
    private readonly auditLogService;
    constructor(corporateAccountRepo: ICorporateAccountRepository, corporateMemberRepo: ICorporateMemberRepository, userRepository: IUserRepository, auditLogService: AuditLogService);
    execute(dto: AddCorporateMemberDto, actorUserId: number): Promise<CorporateMember>;
}
