import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigProvider } from '../application/ConfigProvider.js';
import type { IConfigRepository } from '../domain/repositories/IConfigRepository.js';

describe('ConfigProvider', () => {
  let repository: IConfigRepository;
  let provider: ConfigProvider;

  beforeEach(() => {
    repository = {
      findByKey: vi.fn(),
      findAllConfig: vi.fn(),
    } as unknown as IConfigRepository;

    provider = new ConfigProvider(repository);
  });

  it('should return config value', async () => {
    (repository.findByKey as any).mockResolvedValueOnce({ value: 'true' });
    const result = await provider.get<boolean>('test-key');
    expect(result).toBe(true);
    expect(repository.findByKey).toHaveBeenCalledWith('test-key');
  });

  it('should return default value if not found', async () => {
    (repository.findByKey as any).mockResolvedValueOnce(null);
    const result = await provider.get<string>('unknown-key', 'default');
    expect(result).toBe('default');
  });

  it('should throw error if not found and no default', async () => {
    (repository.findByKey as any).mockResolvedValueOnce(null);
    await expect(provider.get<string>('unknown-key')).rejects.toThrow(
      'Configuration key not found: unknown-key',
    );
  });

  it('should return true for has() if key exists', async () => {
    (repository.findByKey as any).mockResolvedValueOnce({ value: '1' });
    const result = await provider.has('test-key');
    expect(result).toBe(true);
  });

  it('should return false for has() if key not found', async () => {
    (repository.findByKey as any).mockResolvedValueOnce(null);
    const result = await provider.has('unknown-key');
    expect(result).toBe(false);
  });

  it('should return all configs', async () => {
    (repository.findAllConfig as any).mockResolvedValueOnce([
      { key: 'key1', value: 'val1' },
      { key: 'key2', value: 'val2' },
    ]);
    const result = await provider.getAll();
    expect(result).toEqual({ key1: 'val1', key2: 'val2' });
  });
});
