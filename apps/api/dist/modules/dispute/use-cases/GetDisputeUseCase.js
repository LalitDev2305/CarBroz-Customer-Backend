import { ErrorCode } from '@carbroz/foundation-kernel';
export class GetDisputeUseCase {
    disputeRepository;
    constructor(disputeRepository) {
        this.disputeRepository = disputeRepository;
    }
    async execute(publicId) {
        const dispute = await this.disputeRepository.findByPublicId(publicId);
        if (!dispute) {
            throw new Error(ErrorCode.RESOURCE_NOT_FOUND);
        }
        return dispute;
    }
}
//# sourceMappingURL=GetDisputeUseCase.js.map