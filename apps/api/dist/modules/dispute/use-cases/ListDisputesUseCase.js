export class ListDisputesUseCase {
    disputeRepository;
    constructor(disputeRepository) {
        this.disputeRepository = disputeRepository;
    }
    async execute(status, limit, offset) {
        return await this.disputeRepository.list(status, limit, offset);
    }
}
//# sourceMappingURL=ListDisputesUseCase.js.map