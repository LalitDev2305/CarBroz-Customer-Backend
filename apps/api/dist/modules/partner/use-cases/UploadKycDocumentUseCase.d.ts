import { IUseCase, IRequestContext, IStorageProvider, IKycDocumentRepository, KycDocumentType, IPartnerMemberRepository } from '@carbroz/foundation-kernel';
export interface UploadKycDocumentInput {
    context: IRequestContext;
    data: {
        partnerId: number;
        type: KycDocumentType;
        fileBuffer: Buffer;
        mimeType: string;
    };
}
export declare class UploadKycDocumentUseCase implements IUseCase<UploadKycDocumentInput, void> {
    private readonly storageProvider;
    private readonly kycDocumentRepository;
    private readonly partnerMemberRepository;
    constructor(storageProvider: IStorageProvider, kycDocumentRepository: IKycDocumentRepository, partnerMemberRepository: IPartnerMemberRepository);
    execute(request: UploadKycDocumentInput): Promise<void>;
}
