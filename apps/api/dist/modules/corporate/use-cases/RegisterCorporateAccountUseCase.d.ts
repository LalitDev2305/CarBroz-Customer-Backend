import { ICorporateAccountRepository, ICorporateMemberRepository, IUserRepository, CorporateAccount, AuditLogService } from '@carbroz/foundation-kernel';
import { RegisterCorporateAccountDto } from '../dtos/corporate.dto.js';
export declare class RegisterCorporateAccountUseCase {
    private readonly corporateAccountRepo;
    private readonly corporateMemberRepo;
    private readonly userRepository;
    private readonly auditLogService;
    constructor(corporateAccountRepo: ICorporateAccountRepository, corporateMemberRepo: ICorporateMemberRepository, userRepository: IUserRepository, auditLogService: AuditLogService);
    execute(dto: RegisterCorporateAccountDto, actorUserId: number): Promise<CorporateAccount>;
}
