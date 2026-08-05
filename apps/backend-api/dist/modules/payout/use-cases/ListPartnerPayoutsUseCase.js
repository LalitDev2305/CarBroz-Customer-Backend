export class ListPartnerPayoutsUseCase {
    payoutRepository;
    constructor(payoutRepository) {
        this.payoutRepository = payoutRepository;
    }
    async execute(partnerId, status) {
        return await this.payoutRepository.listByPartnerId(partnerId, status);
    }
}
//# sourceMappingURL=ListPartnerPayoutsUseCase.js.map