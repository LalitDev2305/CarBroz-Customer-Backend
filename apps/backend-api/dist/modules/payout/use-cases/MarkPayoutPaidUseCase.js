export class MarkPayoutPaidUseCase {
    payoutRepository;
    constructor(payoutRepository) {
        this.payoutRepository = payoutRepository;
    }
    async execute(input) {
        if (!input.externalReference || input.externalReference.trim().length === 0) {
            throw new Error('External reference is required to mark payout as paid');
        }
        const payout = await this.payoutRepository.findByPublicId(input.publicId);
        if (!payout) {
            throw new Error('Partner payout record not found');
        }
        payout.markPaid(input.externalReference);
        return await this.payoutRepository.update(payout);
    }
}
//# sourceMappingURL=MarkPayoutPaidUseCase.js.map