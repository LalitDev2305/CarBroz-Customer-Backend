import { IPartnerPayoutRepository } from '@carbroz/foundation-kernel';
export declare class ProcessPayoutBatchUseCase {
    private readonly payoutRepository;
    constructor(payoutRepository: IPartnerPayoutRepository);
    execute(): Promise<number>;
}
