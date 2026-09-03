import { type KycDocument } from '../domain/KycDocument.js';
import { KycDocumentStatus } from '../domain/KycDocumentStatus.js';
import { KycDocumentType } from '../domain/KycDocumentType.js';
import { type IKycDocumentRepository } from '../domain/repositories/IKycDocumentRepository.js';
import { type KycStoragePort } from './ports/KycStoragePort.js';

export interface UploadKycInput {
  partnerId: number;
  uploadedById: number;
  type: KycDocumentType;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
}

const KYC_BUCKET = 'partner-kyc-docs';
const KYC_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const KYC_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const KYC_PRESIGNED_URL_TTL_SECONDS = 3600;

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export class UploadPartnerKycDocumentUseCase {
  constructor(
    private readonly kycRepository: IKycDocumentRepository,
    private readonly storageProvider: KycStoragePort,
    private readonly now: () => number = Date.now,
  ) {}

  public async execute(input: UploadKycInput): Promise<{ document: KycDocument; presignedUrl: string }> {
    await this.storageProvider.validateFile(input.fileBuffer, input.mimeType, {
      maxSizeBytes: KYC_MAX_FILE_SIZE_BYTES,
      allowedMimeTypes: KYC_ALLOWED_MIME_TYPES,
    });

    const objectName = `kyc/${input.partnerId}/${input.type}_${this.now()}_${sanitizeFileName(input.fileName)}`;
    const fileUrl = await this.storageProvider.uploadFile(KYC_BUCKET, objectName, input.fileBuffer, input.mimeType);
    const presignedUrl = await this.storageProvider.getPresignedDownloadUrl({
      bucket: KYC_BUCKET,
      objectName,
      expiresInSeconds: KYC_PRESIGNED_URL_TTL_SECONDS,
    });

    const document = await this.kycRepository.create({
      partnerId: input.partnerId,
      type: input.type,
      fileUrl,
      status: KycDocumentStatus.PENDING,
      rejectionReason: null,
      uploadedById: input.uploadedById,
      verifiedById: null,
    });

    return { document, presignedUrl };
  }
}
