import { IPartnerPayoutRepository, PartnerPayout, PayoutStatus } from '@carbroz/common';
export declare class ListPartnerPayoutsUseCase {
    private readonly payoutRepository;
    constructor(payoutRepository: IPartnerPayoutRepository);
    execute(partnerId: number, status?: PayoutStatus): Promise<PartnerPayout[]>;
}
