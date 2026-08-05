import { IPartnerPayoutRepository } from '@carbroz/common';
export declare class ProcessPayoutBatchUseCase {
    private readonly payoutRepository;
    constructor(payoutRepository: IPartnerPayoutRepository);
    execute(): Promise<number>;
}
