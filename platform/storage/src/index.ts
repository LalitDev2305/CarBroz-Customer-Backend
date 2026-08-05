/// <reference types="node" />

export interface IProvider {
  initialize?(): Promise<void>;
  shutdown?(): Promise<void>;
}

export interface IStorageProvider extends IProvider {
  uploadFile(bucket: string, objectName: string, buffer: Buffer, mimeType: string): Promise<string>;
  getFileUrl(bucket: string, objectName: string): Promise<string>;
  deleteFile(bucket: string, objectName: string): Promise<void>;
}
