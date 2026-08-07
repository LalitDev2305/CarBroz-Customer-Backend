import { CorporateAccount, CorporateMember, } from '@carbroz/foundation-kernel';
export class RegisterCorporateAccountUseCase {
    corporateAccountRepo;
    corporateMemberRepo;
    userRepository;
    auditLogService;
    constructor(corporateAccountRepo, corporateMemberRepo, userRepository, auditLogService) {
        this.corporateAccountRepo = corporateAccountRepo;
        this.corporateMemberRepo = corporateMemberRepo;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }
    async execute(dto, actorUserId) {
        const existingGstin = await this.corporateAccountRepo.findByGstin(dto.gstin);
        if (existingGstin) {
            throw new Error(`Corporate account with GSTIN ${dto.gstin} already exists`);
        }
        const account = new CorporateAccount({
            companyName: dto.companyName,
            legalName: dto.legalName,
            gstin: dto.gstin,
            pan: dto.pan,
            billingAddress: dto.billingAddress,
            paymentTermsDays: dto.paymentTermsDays ?? 30,
            status: 'PENDING_APPROVAL',
            creditLimitPaise: 0n,
            utilisedCreditPaise: 0n,
        });
        const savedAccount = await this.corporateAccountRepo.create(account);
        const member = new CorporateMember({
            corporateAccountId: savedAccount.id,
            userId: actorUserId,
            role: 'CORP_ADMIN',
            status: 'ACTIVE',
        });
        await this.corporateMemberRepo.create(member);
        await this.auditLogService.log({
            actorId: actorUserId,
            actorType: 'CUSTOMER',
            action: 'CORPORATE_ACCOUNT_CREATE',
            resource: 'CorporateAccount',
            resourcePublicId: savedAccount.publicId,
            newValue: { companyName: savedAccount.companyName, gstin: savedAccount.gstin },
        });
        return savedAccount;
    }
}
//# sourceMappingURL=RegisterCorporateAccountUseCase.js.map