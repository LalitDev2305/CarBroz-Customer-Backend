import { IStorageProvider, ILoggerProvider, IConfigProvider } from '@carbroz/common';
import * as Minio from 'minio';
import path from 'path';
import fs from 'fs';
import os from 'os';

export class MinIOStorageProvider implements IStorageProvider {
  private client: Minio.Client | null = null;
  private isMockMode = false;
  private mockDir = '';

  constructor(
    private readonly configProvider: IConfigProvider,
    private readonly logger: ILoggerProvider
  ) {}

  private async getClient(): Promise<Minio.Client | null> {
    if (this.client || this.isMockMode) return this.client;

    const endPoint = await this.configProvider.get<string>('MINIO_ENDPOINT');
    const portStr = await this.configProvider.get<string>('MINIO_PORT');
    const accessKey = await this.configProvider.get<string>('MINIO_ACCESS_KEY');
    const secretKey = await this.configProvider.get<string>('MINIO_SECRET_KEY');

    if (!endPoint || !accessKey || !secretKey) {
      this.logger.warn('Storage credentials missing, falling back to mock storage');
      this.isMockMode = true;
      this.mockDir = path.join(os.tmpdir(), 'carbroz-mock-storage');
      if (!fs.existsSync(this.mockDir)) {
        fs.mkdirSync(this.mockDir, { recursive: true });
      }
      return null;
    }

    const port = portStr ? parseInt(portStr, 10) : 9000;

    this.client = new Minio.Client({
      endPoint,
      port,
      useSSL: endPoint.includes('https'),
      accessKey,
      secretKey,
    });
    
    return this.client;
  }

  async uploadFile(bucket: string, objectName: string, buffer: Buffer, mimeType: string): Promise<string> {
    const client = await this.getClient();
    if (this.isMockMode) {
      const bucketDir = path.join(this.mockDir, bucket);
      if (!fs.existsSync(bucketDir)) {
        fs.mkdirSync(bucketDir, { recursive: true });
      }
      const filePath = path.join(bucketDir, objectName);
      const dirname = path.dirname(filePath);
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
      }
      fs.writeFileSync(filePath, buffer);
      return `http://mock-storage/${bucket}/${objectName}`;
    }

    if (!client) throw new Error('MinIO Client not initialized');

    const bucketExists = await client.bucketExists(bucket);
    if (!bucketExists) {
      await client.makeBucket(bucket, 'us-east-1');
      this.logger.info(`Bucket ${bucket} created.`, { provider: 'MinIOStorageProvider' });
    }

    await client.putObject(bucket, objectName, buffer, buffer.length, { 'Content-Type': mimeType });
    const endPoint = await this.configProvider.get<string>('MINIO_ENDPOINT');
    const port = await this.configProvider.get<string>('MINIO_PORT');
    const ssl = await this.configProvider.get<string>('MINIO_USE_SSL') === 'true' ? 'https' : 'http';
    return `${ssl}://${endPoint}:${port}/${bucket}/${objectName}`;
  }

  async getFileUrl(bucket: string, objectName: string): Promise<string> {
    const client = await this.getClient();

    if (this.isMockMode) {
      return `http://localhost:8080/mock-storage/${bucket}/${objectName}`;
    }

    if (!client) throw new Error('Storage client not initialized');

    return await client.presignedGetObject(bucket, objectName, 3600);
  }

  async deleteFile(bucket: string, objectName: string): Promise<void> {
    const client = await this.getClient();

    if (this.isMockMode) {
      const filePath = path.join(this.mockDir, bucket, objectName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return;
    }

    if (!client) throw new Error('Storage client not initialized');

    await client.removeObject(bucket, objectName);
  }
}
