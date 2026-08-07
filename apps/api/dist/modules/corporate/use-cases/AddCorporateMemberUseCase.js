import { CorporateMember, } from '@carbroz/foundation-kernel';
export class AddCorporateMemberUseCase {
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
        const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
        if (!account) {
            throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
        }
        const user = await this.userRepository.findByEmail
            ? await this.userRepository.findByEmail(dto.userEmail)
            : null;
        if (!user) {
            throw new Error(`User with email ${dto.userEmail} does not exist. Please have user register first.`);
        }
        const existingMember = await this.corporateMemberRepo.findByAccountAndUser(account.id, user.id);
        if (existingMember) {
            throw new Error(`User is already a member of this corporate account.`);
        }
        const member = new CorporateMember({
            corporateAccountId: account.id,
            userId: user.id,
            role: dto.role,
            status: 'ACTIVE',
            monthlyCapPaise: dto.monthlyCapPaise != null ? BigInt(dto.monthlyCapPaise) : null,
        });
        const savedMember = await this.corporateMemberRepo.create(member);
        await this.auditLogService.log({
            actorId: actorUserId,
            actorType: 'CUSTOMER',
            action: 'CORPORATE_MEMBER_ADD',
            resource: 'CorporateMember',
            resourcePublicId: savedMember.publicId,
            newValue: { corporateAccountId: account.id, userId: user.id, role: dto.role },
        });
        return savedMember;
    }
}
//# sourceMappingURL=AddCorporateMemberUseCase.js.map