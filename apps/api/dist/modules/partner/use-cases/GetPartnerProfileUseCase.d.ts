import { IUseCase, IRequestContext, IPartnerRepository, IPartnerMemberRepository } from '@carbroz/foundation-kernel';
export declare class GetPartnerProfileUseCase implements IUseCase<{
    context: IRequestContext;
}, any> {
    private readonly partnerRepository;
    private readonly partnerMemberRepository;
    constructor(partnerRepository: IPartnerRepository, partnerMemberRepository: IPartnerMemberRepository);
    execute({ context }: {
        context: IRequestContext;
    }): Promise<any>;
}
