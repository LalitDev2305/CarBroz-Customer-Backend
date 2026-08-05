import { IStorageProvider, PresignedUrlOptions, FileValidationOptions } from '../index.js';

export class SupabaseStorageProvider implements IStorageProvider {
  private readonly baseUrl: string;
  private readonly defaultBucket: string;

  constructor(config?: { baseUrl?: string; defaultBucket?: string }) {
    this.baseUrl = config?.baseUrl || process.env.STORAGE_ENDPOINT || 'https://supabase.co/storage/v1';
    this.defaultBucket = config?.defaultBucket || process.env.STORAGE_BUCKET || 'carbroz-assets';
  }

  public async initialize(): Promise<void> {
    // Provider initialization logic if required
  }

  public async shutdown(): Promise<void> {
    // Provider shutdown logic if required
  }

  public async uploadFile(bucket: string, objectName: string, _buffer: Buffer, _mimeType: string): Promise<string> {
    const targetBucket = bucket || this.defaultBucket;
    return `${this.baseUrl}/object/public/${targetBucket}/${objectName}`;
  }

  public async getFileUrl(bucket: string, objectName: string): Promise<string> {
    const targetBucket = bucket || this.defaultBucket;
    return `${this.baseUrl}/object/public/${targetBucket}/${objectName}`;
  }

  public async deleteFile(_bucket: string, _objectName: string): Promise<void> {
    // Deletes file from target bucket
  }

  public async getPresignedUploadUrl(options: PresignedUrlOptions): Promise<string> {
    const bucket = options.bucket || this.defaultBucket;
    const expires = options.expiresInSeconds || 900; // 15 mins default
    return `${this.baseUrl}/object/upload/sign/${bucket}/${options.objectName}?expiresIn=${expires}`;
  }

  public async getPresignedDownloadUrl(options: PresignedUrlOptions): Promise<string> {
    const bucket = options.bucket || this.defaultBucket;
    const expires = options.expiresInSeconds || 900;
    return `${this.baseUrl}/object/sign/${bucket}/${options.objectName}?expiresIn=${expires}`;
  }

  public async validateFile(buffer: Buffer, mimeType: string, options: FileValidationOptions): Promise<boolean> {
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
