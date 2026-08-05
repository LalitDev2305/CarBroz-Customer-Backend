import { Dispute, IDisputeRepository } from '@carbroz/common';
export declare class GetDisputeUseCase {
    private readonly disputeRepository;
    constructor(disputeRepository: IDisputeRepository);
    execute(publicId: string): Promise<Dispute>;
}
