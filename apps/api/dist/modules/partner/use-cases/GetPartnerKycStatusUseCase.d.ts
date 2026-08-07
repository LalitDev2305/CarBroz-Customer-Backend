import { IUseCase, IRequestContext, IKycDocumentRepository, IPartnerMemberRepository, KycDocument } from '@carbroz/foundation-kernel';
export interface GetPartnerKycStatusInput {
    context: IRequestContext;
    data: {
        partnerId: number;
    };
}
export declare class GetPartnerKycStatusUseCase implements IUseCase<GetPartnerKycStatusInput, KycDocument[]> {
    private readonly kycDocumentRepository;
    private readonly partnerMemberRepository;
    constructor(kycDocumentRepository: IKycDocumentRepository, partnerMemberRepository: IPartnerMemberRepository);
    execute(request: GetPartnerKycStatusInput): Promise<KycDocument[]>;
}
