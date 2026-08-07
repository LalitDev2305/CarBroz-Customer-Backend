import { Dispute, IDisputeRepository } from '@carbroz/foundation-kernel';
export declare class GetDisputeUseCase {
    private readonly disputeRepository;
    constructor(disputeRepository: IDisputeRepository);
    execute(publicId: string): Promise<Dispute>;
}
