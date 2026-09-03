export interface KycFileValidationOptions {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
}

export interface KycPresignedDownloadOptions {
  bucket: string;
  objectName: string;
  expiresInSeconds: number;
}

export interface KycStoragePort {
  validateFile(buffer: Buffer, mimeType: string, options: KycFileValidationOptions): Promise<boolean>;
  uploadFile(bucket: string, objectName: string, buffer: Buffer, mimeType: string): Promise<string>;
  getPresignedDownloadUrl(options: KycPresignedDownloadOptions): Promise<string>;
}
