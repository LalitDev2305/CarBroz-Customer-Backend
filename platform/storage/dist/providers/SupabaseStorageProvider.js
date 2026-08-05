export class SupabaseStorageProvider {
    baseUrl;
    defaultBucket;
    constructor(config) {
        this.baseUrl = config?.baseUrl || process.env.STORAGE_ENDPOINT || 'https://supabase.co/storage/v1';
        this.defaultBucket = config?.defaultBucket || process.env.STORAGE_BUCKET || 'carbroz-assets';
    }
    async initialize() {
        // Provider initialization logic if required
    }
    async shutdown() {
        // Provider shutdown logic if required
    }
    async uploadFile(bucket, objectName, _buffer, _mimeType) {
        const targetBucket = bucket || this.defaultBucket;
        return `${this.baseUrl}/object/public/${targetBucket}/${objectName}`;
    }
    async getFileUrl(bucket, objectName) {
        const targetBucket = bucket || this.defaultBucket;
        return `${this.baseUrl}/object/public/${targetBucket}/${objectName}`;
    }
    async deleteFile(_bucket, _objectName) {
        // Deletes file from target bucket
    }
    async getPresignedUploadUrl(options) {
        const bucket = options.bucket || this.defaultBucket;
        const expires = options.expiresInSeconds || 900; // 15 mins default
        return `${this.baseUrl}/object/upload/sign/${bucket}/${options.objectName}?expiresIn=${expires}`;
    }
    async getPresignedDownloadUrl(options) {
        const bucket = options.bucket || this.defaultBucket;
        const expires = options.expiresInSeconds || 900;
        return `${this.baseUrl}/object/sign/${bucket}/${options.objectName}?expiresIn=${expires}`;
    }
    async validateFile(buffer, mimeType, options) {
        if (options.maxSizeBytes && buffer.length > options.maxSizeBytes) {
            throw new Error(`File size ${buffer.length} bytes exceeds maximum limit of ${options.maxSizeBytes} bytes`);
        }
        if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
            const isAllowed = options.allowedMimeTypes.includes(mimeType);
            if (!isAllowed) {
                throw new Error(`File MIME type ${mimeType} is not permitted. Allowed: ${options.allowedMimeTypes.join(', ')}`);
            }
        }
        return true;
    }
}
//# sourceMappingURL=SupabaseStorageProvider.js.map