import { IUseCase, IRequestContext, IPartnerRepository, IPartnerMemberRepository, ITransactionProvider } from '@carbroz/common';
import { RegisterOrganizationPartnerDto } from '../dtos/partner.dto.js';
export declare class RegisterOrganizationPartnerUseCase implements IUseCase<{
    context: IRequestContext;
    data: RegisterOrganizationPartnerDto;
}, any> {
    private readonly partnerRepository;
    private readonly partnerMemberRepository;
    private readonly transactionProvider;
    constructor(partnerRepository: IPartnerRepository, partnerMemberRepository: IPartnerMemberRepository, transactionProvider: ITransactionProvider);
    execute({ context, data }: {
        context: IRequestContext;
        data: RegisterOrganizationPartnerDto;
    }): Promise<any>;
}
