export class RemoveCorporateMemberUseCase {
    corporateAccountRepo;
    corporateMemberRepo;
    auditLogService;
    constructor(corporateAccountRepo, corporateMemberRepo, auditLogService) {
        this.corporateAccountRepo = corporateAccountRepo;
        this.corporateMemberRepo = corporateMemberRepo;
        this.auditLogService = auditLogService;
    }
    async execute(dto, actorUserId) {
        const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
        if (!account) {
            throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
        }
        const member = await this.corporateMemberRepo.findByPublicId(dto.memberPublicId);
        if (!member || member.corporateAccountId !== account.id) {
            throw new Error(`Corporate member not found`);
        }
        member.deactivate();
        await this.corporateMemberRepo.update(member);
        await this.auditLogService.log({
            actorId: actorUserId,
            actorType: 'CUSTOMER',
            action: 'CORPORATE_MEMBER_REMOVE',
            resource: 'CorporateMember',
            resourcePublicId: member.publicId,
            oldValue: { status: 'ACTIVE' },
            newValue: { status: 'INACTIVE' },
        });
    }
}
//# sourceMappingURL=RemoveCorporateMemberUseCase.js.map