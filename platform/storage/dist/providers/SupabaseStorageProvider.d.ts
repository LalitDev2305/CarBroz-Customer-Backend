import { IStorageProvider } from '@carbroz/foundation-kernel';
export interface PresignedUrlOptions {
    bucket: string;
    objectName: string;
    expiresInSeconds?: number;
    contentType?: string;
}
export interface FileValidationOptions {
    maxSizeBytes?: number;
    allowedMimeTypes?: string[];
}
export declare class SupabaseStorageProvider implements IStorageProvider {
    private readonly baseUrl;
    private readonly defaultBucket;
    constructor(config?: {
        baseUrl?: string;
        defaultBucket?: string;
    });
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    uploadFile(bucket: string, objectName: string, _buffer: Buffer, _mimeType: string): Promise<string>;
    getFileUrl(bucket: string, objectName: string): Promise<string>;
    deleteFile(_bucket: string, _objectName: string): Promise<void>;
    getPresignedUploadUrl(options: PresignedUrlOptions): Promise<string>;
    getPresignedDownloadUrl(options: PresignedUrlOptions): Promise<string>;
    validateFile(buffer: Buffer, mimeType: string, options: FileValidationOptions): Promise<boolean>;
}
//# sourceMappingURL=SupabaseStorageProvider.d.ts.map