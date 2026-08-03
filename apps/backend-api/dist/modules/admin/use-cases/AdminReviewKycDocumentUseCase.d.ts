import { IUseCase, IRequestContext, IKycDocumentRepository, KycDocument, IPartnerRepository } from '@carbroz/common';
export interface AdminReviewKycDocumentInput {
    context: IRequestContext;
    data: {
        documentId: number;
        action: 'APPROVE' | 'REJECT';
        reason?: string;
    };
}
export declare class AdminReviewKycDocumentUseCase implements IUseCase<AdminReviewKycDocumentInput, KycDocument> {
    private readonly kycDocumentRepository;
    private readonly partnerRepository;
    constructor(kycDocumentRepository: IKycDocumentRepository, partnerRepository: IPartnerRepository);
    execute(request: AdminReviewKycDocumentInput): Promise<KycDocument>;
}
