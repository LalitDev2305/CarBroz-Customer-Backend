export class GetPartnerProfileUseCase {
    partnerRepository;
    partnerMemberRepository;
    constructor(partnerRepository, partnerMemberRepository) {
        this.partnerRepository = partnerRepository;
        this.partnerMemberRepository = partnerMemberRepository;
    }
    async execute({ context }) {
        if (!context.authenticatedUser) {
            throw new Error("Unauthorized");
        }
        const userId = context.authenticatedUser.id;
        const memberships = await this.partnerMemberRepository.findByUserId(userId);
        if (memberships.length === 0) {
            throw new Error("Partner profile not found");
        }
        // For Phase 8, we assume the user belongs to only 1 partner.
        const primaryMembership = memberships[0];
        const partner = await this.partnerRepository.findById(primaryMembership.partnerId);
        return {
            partner,
            membership: primaryMembership
        };
    }
}
//# sourceMappingURL=GetPartnerProfileUseCase.js.map