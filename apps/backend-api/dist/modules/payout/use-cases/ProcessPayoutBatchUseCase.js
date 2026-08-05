export class ProcessPayoutBatchUseCase {
    payoutRepository;
    constructor(payoutRepository) {
        this.payoutRepository = payoutRepository;
    }
    async execute() {
        const scheduledPayouts = await this.payoutRepository.listByStatus('SCHEDULED', 100);
        let count = 0;
        for (const payout of scheduledPayouts) {
            payout.approve();
            payout.markProcessing();
            await this.payoutRepository.update(payout);
            count++;
        }
        return count;
    }
}
//# sourceMappingURL=ProcessPayoutBatchUseCase.js.map