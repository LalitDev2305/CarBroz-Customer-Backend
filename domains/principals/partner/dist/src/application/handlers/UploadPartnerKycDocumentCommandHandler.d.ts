import { KycDocument } from '../../domain/entities/KycDocument.js';
import { KycDocumentType } from '../../domain/enums/KycDocumentType.js';
import { PrismaKycDocumentRepository } from '../../infrastructure/persistence/prisma/PrismaKycDocumentRepository.js';
import { IStorageProvider } from '@carbroz/foundation-kernel';
export interface UploadKycInput {
    partnerId: number;
    uploadedById: number;
    type: KycDocumentType;
    fileName: string;
    fileBuffer: Uint8Array;
    mimeType: string;
}
export declare class UploadPartnerKycDocumentCommandHandler {
    private readonly kycRepository;
    private readonly storageProvider;
    constructor(kycRepository: PrismaKycDocumentRepository, storageProvider: IStorageProvider);
    execute(input: UploadKycInput): Promise<{
        document: KycDocument;
        presignedUrl: string;
    }>;
}
