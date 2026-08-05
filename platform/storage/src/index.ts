/// <reference types="node" />

export interface IProvider {
  initialize?(): Promise<void>;
  shutdown?(): Promise<void>;
}

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

export interface IStorageProvider extends IProvider {
  uploadFile(bucket: string, objectName: string, buffer: Buffer, mimeType: string): Promise<string>;
  getFileUrl(bucket: string, objectName: string): Promise<string>;
  deleteFile(bucket: string, objectName: string): Promise<void>;
  getPresignedUploadUrl(options: PresignedUrlOptions): Promise<string>;
  getPresignedDownloadUrl(options: PresignedUrlOptions): Promise<string>;
  validateFile(buffer: Buffer, mimeType: string, options: FileValidationOptions): Promise<boolean>;
}

export * from './providers/SupabaseStorageProvider.js';
