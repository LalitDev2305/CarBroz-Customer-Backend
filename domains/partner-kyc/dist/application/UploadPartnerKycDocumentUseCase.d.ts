import { KycDocument } from '../domain/KycDocument.js';
import { KycDocumentType } from '../domain/KycDocumentType.js';
import { PrismaKycDocumentRepository } from '../infrastructure/repositories/PrismaKycDocumentRepository.js';
import { IStorageProvider } from '@carbroz/platform-storage';
export interface UploadKycInput {
    partnerId: number;
    uploadedById: number;
    type: KycDocumentType;
    fileName: string;
    fileBuffer: Buffer;
    mimeType: string;
}
export declare class UploadPartnerKycDocumentUseCase {
    private readonly kycRepository;
    private readonly storageProvider;
    constructor(kycRepository: PrismaKycDocumentRepository, storageProvider: IStorageProvider);
    execute(input: UploadKycInput): Promise<{
        document: KycDocument;
        presignedUrl: string;
    }>;
}
//# sourceMappingURL=UploadPartnerKycDocumentUseCase.d.ts.map