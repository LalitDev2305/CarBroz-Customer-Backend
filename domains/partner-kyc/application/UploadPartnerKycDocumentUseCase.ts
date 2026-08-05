import { KycDocument } from '../domain/KycDocument.js';
import { KycDocumentStatus } from '../domain/KycDocumentStatus.js';
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

export class UploadPartnerKycDocumentUseCase {
  constructor(
    private readonly kycRepository: PrismaKycDocumentRepository,
    private readonly storageProvider: IStorageProvider
  ) {}

  public async execute(input: UploadKycInput): Promise<{ document: KycDocument; presignedUrl: string }> {
    // 1. Validate File Size & Type
    await this.storageProvider.validateFile(input.fileBuffer, input.mimeType, {
      maxSizeBytes: 10 * 1024 * 1024, // 10MB limit
      allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    });

    const objectName = `kyc/${input.partnerId}/${input.type}_${Date.now()}_${input.fileName}`;

    // 2. Upload file to Supabase / S3 bucket
    const fileUrl = await this.storageProvider.uploadFile('partner-kyc-docs', objectName, input.fileBuffer, input.mimeType);

    // 3. Generate presigned download URL for secure inspection
    const presignedUrl = await this.storageProvider.getPresignedDownloadUrl({
      bucket: 'partner-kyc-docs',
      objectName,
      expiresInSeconds: 3600, // 1 hr expiry
    });

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
