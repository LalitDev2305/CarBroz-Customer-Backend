import { IStorageProvider, ILoggerProvider, IConfigProvider } from '@carbroz/common';
export declare class MinIOStorageProvider implements IStorageProvider {
    private readonly configProvider;
    private readonly logger;
    private client;
    private isMockMode;
    private mockDir;
    constructor(configProvider: IConfigProvider, logger: ILoggerProvider);
    private getClient;
    uploadFile(bucket: string, objectName: string, buffer: Buffer, mimeType: string): Promise<string>;
    getFileUrl(bucket: string, objectName: string): Promise<string>;
    deleteFile(bucket: string, objectName: string): Promise<void>;
}
