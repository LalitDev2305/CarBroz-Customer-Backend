import { Dispute, DisputeStatus, IDisputeRepository } from '@carbroz/common';
export declare class ListDisputesUseCase {
    private readonly disputeRepository;
    constructor(disputeRepository: IDisputeRepository);
    execute(status?: DisputeStatus, limit?: number, offset?: number): Promise<Dispute[]>;
}
