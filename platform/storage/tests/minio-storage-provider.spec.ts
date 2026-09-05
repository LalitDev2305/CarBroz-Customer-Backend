import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MinIOStorageProvider } from '../src/providers/MinIOStorageProvider.js';

function createConfig(values: Record<string, string | undefined>) {
  return {
    get: vi.fn(async (key: string) => values[key]),
  };
}

function createLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
}

function createClient(overrides: Record<string, unknown> = {}) {
  return {
    bucketExists: vi.fn().mockResolvedValue(true),
    makeBucket: vi.fn().mockResolvedValue(undefined),
    putObject: vi.fn().mockResolvedValue(undefined),
    presignedGetObject: vi.fn().mockResolvedValue('https://signed.example/object'),
    removeObject: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('MinIOStorageProvider', () => {
  const mockRoot = path.join(os.tmpdir(), 'carbroz-mock-storage');

  beforeEach(() => {
    fs.rmSync(mockRoot, { recursive: true, force: true });
  });

  afterEach(() => {
    fs.rmSync(mockRoot, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('falls back to mock storage when credentials are missing and persists nested objects', async () => {
    const config = createConfig({
      MINIO_ENDPOINT: undefined,
      MINIO_PORT: undefined,
      MINIO_ACCESS_KEY: undefined,
      MINIO_SECRET_KEY: undefined,
    });
    const logger = createLogger();
    const provider = new MinIOStorageProvider(config as never, logger as never);
    const payload = Buffer.from('carbroz-image');

    const url = await provider.uploadFile('booking-proof', '2026/09/photo.jpg', payload, 'image/jpeg');

    expect(url).toBe('http://mock-storage/booking-proof/2026/09/photo.jpg');
    expect(logger.warn).toHaveBeenCalledWith('Storage credentials missing, falling back to mock storage');
    expect(fs.readFileSync(path.join(mockRoot, 'booking-proof', '2026', '09', 'photo.jpg'))).toEqual(payload);
    expect(config.get).toHaveBeenCalledWith('MINIO_ENDPOINT');
    expect(config.get).toHaveBeenCalledWith('MINIO_ACCESS_KEY');
    expect(config.get).toHaveBeenCalledWith('MINIO_SECRET_KEY');
  });

  it('reuses mock mode, returns mock file URLs, and deletes existing or absent objects safely', async () => {
    const config = createConfig({});
    const logger = createLogger();
    const provider = new MinIOStorageProvider(config as never, logger as never);

    await provider.uploadFile('documents', 'invoice.pdf', Buffer.from('invoice'), 'application/pdf');
    const stored = path.join(mockRoot, 'documents', 'invoice.pdf');
    expect(fs.existsSync(stored)).toBe(true);

    await expect(provider.getFileUrl('documents', 'invoice.pdf'))
      .resolves.toBe('http://localhost:8080/mock-storage/documents/invoice.pdf');

    await provider.deleteFile('documents', 'invoice.pdf');
    expect(fs.existsSync(stored)).toBe(false);

    await expect(provider.deleteFile('documents', 'missing.pdf')).resolves.toBeUndefined();
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it('uploads through an existing real bucket without attempting bucket creation', async () => {
    const config = createConfig({
      MINIO_ENDPOINT: 'minio.internal',
      MINIO_PORT: '9000',
      MINIO_USE_SSL: 'false',
    });
    const logger = createLogger();
    const client = createClient({ bucketExists: vi.fn().mockResolvedValue(true) });
    const provider = new MinIOStorageProvider(config as never, logger as never);
    Object.assign(provider, { client, isMockMode: false });
    const payload = Buffer.from('binary');

    const url = await provider.uploadFile('photos', 'before.jpg', payload, 'image/jpeg');

    expect(client.bucketExists).toHaveBeenCalledWith('photos');
    expect(client.makeBucket).not.toHaveBeenCalled();
    expect(client.putObject).toHaveBeenCalledWith(
      'photos',
      'before.jpg',
      payload,
      payload.length,
      { 'Content-Type': 'image/jpeg' },
    );
    expect(url).toBe('http://minio.internal:9000/photos/before.jpg');
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('creates a missing real bucket and returns the configured HTTPS object URL', async () => {
    const config = createConfig({
      MINIO_ENDPOINT: 'storage.carbroz.test',
      MINIO_PORT: '9443',
      MINIO_USE_SSL: 'true',
    });
    const logger = createLogger();
    const client = createClient({ bucketExists: vi.fn().mockResolvedValue(false) });
    const provider = new MinIOStorageProvider(config as never, logger as never);
    Object.assign(provider, { client, isMockMode: false });

    const url = await provider.uploadFile('kyc', 'partner/pan.jpg', Buffer.from('pan'), 'image/jpeg');

    expect(client.makeBucket).toHaveBeenCalledWith('kyc', 'us-east-1');
    expect(logger.info).toHaveBeenCalledWith('Bucket kyc created.', { provider: 'MinIOStorageProvider' });
    expect(url).toBe('https://storage.carbroz.test:9443/kyc/partner/pan.jpg');
  });

  it('delegates real file URL generation to a one-hour presigned object URL', async () => {
    const config = createConfig({});
    const logger = createLogger();
    const client = createClient({
      presignedGetObject: vi.fn().mockResolvedValue('https://signed.example/booking/file.jpg?token=abc'),
    });
    const provider = new MinIOStorageProvider(config as never, logger as never);
    Object.assign(provider, { client, isMockMode: false });

    await expect(provider.getFileUrl('booking', 'file.jpg'))
      .resolves.toBe('https://signed.example/booking/file.jpg?token=abc');
    expect(client.presignedGetObject).toHaveBeenCalledWith('booking', 'file.jpg', 3600);
  });

  it('delegates real deletion to MinIO removeObject', async () => {
    const config = createConfig({});
    const logger = createLogger();
    const client = createClient();
    const provider = new MinIOStorageProvider(config as never, logger as never);
    Object.assign(provider, { client, isMockMode: false });

    await expect(provider.deleteFile('booking', 'obsolete.jpg')).resolves.toBeUndefined();
    expect(client.removeObject).toHaveBeenCalledWith('booking', 'obsolete.jpg');
  });
});
