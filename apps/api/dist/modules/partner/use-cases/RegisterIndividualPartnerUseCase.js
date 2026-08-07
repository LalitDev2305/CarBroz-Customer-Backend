import { PartnerType, PartnerStatus, PartnerMemberRole, PartnerMemberStatus } from '@carbroz/foundation-kernel';
export class RegisterIndividualPartnerUseCase {
    partnerRepository;
    partnerMemberRepository;
    transactionProvider;
    constructor(partnerRepository, partnerMemberRepository, transactionProvider) {
        this.partnerRepository = partnerRepository;
        this.partnerMemberRepository = partnerMemberRepository;
        this.transactionProvider = transactionProvider;
    }
    async execute({ context, data }) {
        if (!context.authenticatedUser) {
            throw new Error("Unauthorized");
        }
        const userId = context.authenticatedUser.id;
        const existingMembership = await this.partnerMemberRepository.findByUserId(userId);
        if (existingMembership.length > 0) {
            throw new Error("User is already associated with a partner");
        }
        return this.transactionProvider.runInTransaction(async (uow) => {
            this.partnerRepository.setUnitOfWork(uow);
            this.partnerMemberRepository.setUnitOfWork(uow);
            const partner = await this.partnerRepository.create({
                businessName: data.businessName,
                type: PartnerType.INDIVIDUAL,
                status: PartnerStatus.PENDING
            });
            const partnerMember = await this.partnerMemberRepository.create({
                userId,
                partnerId: partner.id,
                role: PartnerMemberRole.OWNER,
                status: PartnerMemberStatus.ACTIVE
            });
            return { partner, member: partnerMember };
        });
    }
}
//# sourceMappingURL=RegisterIndividualPartnerUseCase.js.map