import { IUseCase, IRequestContext, IPartnerRepository } from '@carbroz/foundation-kernel';
import { VerifyPartnerDto } from '../dtos/partner.dto.js';
export declare class VerifyPartnerUseCase implements IUseCase<{
    context: IRequestContext;
    data: VerifyPartnerDto & {
        partnerId: string;
    };
}, any> {
    private readonly partnerRepository;
    constructor(partnerRepository: IPartnerRepository);
    execute({ data }: {
        context: IRequestContext;
        data: VerifyPartnerDto & {
            partnerId: string;
        };
    }): Promise<any>;
}
