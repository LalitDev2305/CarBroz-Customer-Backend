export class VerifyPartnerUseCase {
    partnerRepository;
    constructor(partnerRepository) {
        this.partnerRepository = partnerRepository;
    }
    async execute({ data }) {
        const partner = await this.partnerRepository.findByPublicId(data.partnerId);
        if (!partner) {
            throw new Error("Partner not found");
        }
        partner.status = data.status;
        const updated = await this.partnerRepository.save(partner);
        return updated;
    }
}
//# sourceMappingURL=VerifyPartnerUseCase.js.map