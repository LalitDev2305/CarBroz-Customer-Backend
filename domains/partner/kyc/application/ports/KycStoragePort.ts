/** KycFileValidationOptions is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
export interface KycFileValidationOptions {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
}

/** KycPresignedDownloadOptions is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
export interface KycPresignedDownloadOptions {
  bucket: string;
  objectName: string;
  expiresInSeconds: number;
}

/** KycStoragePort is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
export interface KycStoragePort {
  validateFile(buffer: Buffer, mimeType: string, options: KycFileValidationOptions): Promise<boolean>;
  uploadFile(bucket: string, objectName: string, buffer: Buffer, mimeType: string): Promise<string>;
  getPresignedDownloadUrl(options: KycPresignedDownloadOptions): Promise<string>;
}
