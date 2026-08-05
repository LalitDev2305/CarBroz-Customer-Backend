export class UploadPartnerKycDocumentUseCase {
    kycRepository;
    storageProvider;
    constructor(kycRepository, storageProvider) {
        this.kycRepository = kycRepository;
        this.storageProvider = storageProvider;
    }
    async execute(input) {
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
            status: 'PENDING',
            rejectionReason: null,
            uploadedById: input.uploadedById,
            verifiedById: null,
        });
        return { document, presignedUrl };
    }
}
//# sourceMappingURL=UploadPartnerKycDocumentUseCase.js.map