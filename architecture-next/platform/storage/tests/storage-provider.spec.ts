import { describe, it, expect } from 'vitest';
import { SupabaseStorageProvider } from '../src/providers/SupabaseStorageProvider.js';

describe('SupabaseStorageProvider & Storage Platform', () => {
  const provider = new SupabaseStorageProvider({
    baseUrl: 'https://test-supabase.co/storage/v1',
    defaultBucket: 'carbroz-test',
  });

  it('should generate valid public file URL', async () => {
    const url = await provider.getFileUrl('carbroz-test', 'docs/test.pdf');
    expect(url).toBe('https://test-supabase.co/storage/v1/object/public/carbroz-test/docs/test.pdf');
  });

  it('should generate valid presigned upload URL', async () => {
    const presignedUrl = await provider.getPresignedUploadUrl({
      bucket: 'carbroz-test',
      objectName: 'docs/test.pdf',
      expiresInSeconds: 600,
    });
    expect(presignedUrl).toContain('https://test-supabase.co/storage/v1/object/upload/sign/carbroz-test/docs/test.pdf');
    expect(presignedUrl).toContain('expiresIn=600');
  });

  it('should validate file size and MIME type correctly', async () => {
    const validBuffer = Buffer.from('test content');
    const isValid = await provider.validateFile(validBuffer, 'application/pdf', {
      maxSizeBytes: 1024,
      allowedMimeTypes: ['application/pdf', 'image/png'],
    });
    expect(isValid).toBe(true);
  });

  it('should reject file exceeding size limit', async () => {
    const largeBuffer = Buffer.alloc(2000);
    await expect(
      provider.validateFile(largeBuffer, 'application/pdf', {
        maxSizeBytes: 1000,
      })
    ).rejects.toThrow(/exceeds maximum limit/);
  });

  it('should reject unpermitted MIME type', async () => {
    const buffer = Buffer.from('test');
    await expect(
      provider.validateFile(buffer, 'application/x-msdownload', {
        allowedMimeTypes: ['image/jpeg', 'image/png'],
      })
    ).rejects.toThrow(/is not permitted/);
  });
});
