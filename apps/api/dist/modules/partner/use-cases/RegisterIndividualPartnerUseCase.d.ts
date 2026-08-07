import { IUseCase, IRequestContext, IPartnerRepository, IPartnerMemberRepository, ITransactionProvider } from '@carbroz/foundation-kernel';
import { RegisterIndividualPartnerDto } from '../dtos/partner.dto.js';
export declare class RegisterIndividualPartnerUseCase implements IUseCase<{
    context: IRequestContext;
    data: RegisterIndividualPartnerDto;
}, any> {
    private readonly partnerRepository;
    private readonly partnerMemberRepository;
    private readonly transactionProvider;
    constructor(partnerRepository: IPartnerRepository, partnerMemberRepository: IPartnerMemberRepository, transactionProvider: ITransactionProvider);
    execute({ context, data }: {
        context: IRequestContext;
        data: RegisterIndividualPartnerDto;
    }): Promise<any>;
}
