import { IProvider } from './IProvider.js';
export interface IStorageProvider extends IProvider {
    /**
     * Uploads a file buffer to the storage backend.
     * @param bucket The storage bucket (e.g., 'kyc-documents')
     * @param objectName The unique object name / path
     * @param buffer The file buffer
     * @param mimeType The file mime type
     * @returns The generated URL to access the file
     */
    uploadFile(bucket: string, objectName: string, buffer: Buffer, mimeType: string): Promise<string>;
    /**
     * Retrieves a signed URL or direct URL for an object.
     */
    getFileUrl(bucket: string, objectName: string): Promise<string>;
    /**
     * Deletes a file from the storage backend.
     */
    deleteFile(bucket: string, objectName: string): Promise<void>;
}
