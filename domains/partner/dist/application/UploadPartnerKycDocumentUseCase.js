export class UploadPartnerKycDocumentUseCase {
    kycRepository;
    storageProvider;
    constructor(kycRepository, storageProvider) {
        this.kycRepository = kycRepository;
        this.storageProvider = storageProvider;
    }
    async execute(input) {
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
            status: 'PENDING',
            rejectionReason: null,
            uploadedById: input.uploadedById,
            verifiedById: null,
        });
        return { document, presignedUrl };
    }
}
//# sourceMappingURL=UploadPartnerKycDocumentUseCase.js.map