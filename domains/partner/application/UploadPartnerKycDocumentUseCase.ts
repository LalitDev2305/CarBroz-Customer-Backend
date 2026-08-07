import { KycDocument } from '../domain/KycDocument.js';
import { KycDocumentStatus } from '../domain/KycDocumentStatus.js';
import { KycDocumentType } from '../domain/KycDocumentType.js';
import { PrismaKycDocumentRepository } from '../infrastructure/repositories/PrismaKycDocumentRepository.js';
import { IStorageProvider } from '@carbroz/foundation-kernel';

export interface UploadKycInput {
  partnerId: number;
  uploadedById: number;
  type: KycDocumentType;
  fileName: string;
  fileBuffer: Uint8Array;
  mimeType: string;
}


export class UploadPartnerKycDocumentUseCase {
  constructor(
    private readonly kycRepository: PrismaKycDocumentRepository,
    private readonly storageProvider: IStorageProvider
  ) {}

  public async execute(input: UploadKycInput): Promise<{ document: KycDocument; presignedUrl: string }> {
    const objectName = `kyc/${input.partnerId}/${input.type}_${Date.now()}_${input.fileName}`;

    // 2. Upload file to Supabase / S3 bucket
    const fileUrl = await this.storageProvider.uploadFile('partner-kyc-docs', objectName, input.fileBuffer, input.mimeType);

    // 3. Get download URL
    const presignedUrl = await this.storageProvider.getFileUrl('partner-kyc-docs', objectName);


    // 4. Save metadata to repository in PENDING state
    const document = await this.kycRepository.create({
      partnerId: input.partnerId,
      type: input.type,
      fileUrl,
      status: 'PENDING' as KycDocumentStatus,
      rejectionReason: null,
      uploadedById: input.uploadedById,
      verifiedById: null,
    });

    return { document, presignedUrl };
  }
}
