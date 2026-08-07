import { IPartnerPayoutRepository, PartnerPayout } from '@carbroz/foundation-kernel';
export interface MarkPayoutPaidInput {
    publicId: string;
    externalReference: string;
}
export declare class MarkPayoutPaidUseCase {
    private readonly payoutRepository;
    constructor(payoutRepository: IPartnerPayoutRepository);
    execute(input: MarkPayoutPaidInput): Promise<PartnerPayout>;
}
