import { IStorageProvider } from '../ports/IStorageProvider.js';
import { ILoggerProvider } from '@carbroz/platform-observability';
import * as Minio from 'minio';
import path from 'path';
import fs from 'fs';
import os from 'os';

interface MinioRuntimeConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
}

/** MinIOStorageProvider is an exported platform/storage contract/implementation; see the owning README for lifecycle and extension rules. */
export class MinIOStorageProvider implements IStorageProvider {
  private client: Minio.Client | null = null;
  private isMockMode = false;
  private mockDir = '';

  constructor(private readonly logger: ILoggerProvider) {}

  private readRuntimeConfig(): MinioRuntimeConfig {
    const parsedPort = Number.parseInt(process.env.MINIO_PORT ?? '9000', 10);
    return {
      endPoint: process.env.MINIO_ENDPOINT?.trim() ?? '',
      port: Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 9000,
      useSSL: process.env.MINIO_USE_SSL?.trim().toLowerCase() === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY?.trim() ?? '',
      secretKey: process.env.MINIO_SECRET_KEY?.trim() ?? '',
    };
  }

  private async getClient(): Promise<Minio.Client | null> {
    if (this.client || this.isMockMode) return this.client;

    const config = this.readRuntimeConfig();
    if (!config.endPoint || !config.accessKey || !config.secretKey) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Production storage configuration is incomplete');
      }

      this.logger.warn('Storage credentials missing, falling back to mock storage');
      this.isMockMode = true;
      this.mockDir = path.join(os.tmpdir(), 'carbroz-mock-storage');
      if (!fs.existsSync(this.mockDir)) {
        fs.mkdirSync(this.mockDir, { recursive: true });
      }
      return null;
    }

    this.client = new Minio.Client(config);
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
    const config = this.readRuntimeConfig();
    const scheme = config.useSSL ? 'https' : 'http';
    return `${scheme}://${config.endPoint}:${config.port}/${bucket}/${objectName}`;
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
