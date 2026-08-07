import { IPartnerPayoutRepository, PartnerPayout, PayoutStatus } from '@carbroz/foundation-kernel';
export declare class ListPartnerPayoutsUseCase {
    private readonly payoutRepository;
    constructor(payoutRepository: IPartnerPayoutRepository);
    execute(partnerId: number, status?: PayoutStatus): Promise<PartnerPayout[]>;
}
