import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IFeatureFlagRepository } from '@carbroz/common';
import { FeatureFlagProvider } from '../application/FeatureFlagProvider.js';

describe('FeatureFlagProvider', () => {
  let repository: IFeatureFlagRepository;
  let provider: FeatureFlagProvider;

  beforeEach(() => {
    repository = {
      findByKey: vi.fn(),
      findAllFlags: vi.fn(),
    } as unknown as IFeatureFlagRepository;

    provider = new FeatureFlagProvider(repository);
  });

  it('returns true when a flag is enabled', async () => {
    vi.mocked(repository.findByKey).mockResolvedValueOnce({ enabled: true } as never);

    await expect(provider.isEnabled('test-flag')).resolves.toBe(true);
    expect(repository.findByKey).toHaveBeenCalledWith('test-flag');
  });

  it('returns false when a flag is disabled', async () => {
    vi.mocked(repository.findByKey).mockResolvedValueOnce({ enabled: false } as never);

    await expect(provider.isEnabled('test-flag')).resolves.toBe(false);
  });

  it('returns false when a flag does not exist', async () => {
    vi.mocked(repository.findByKey).mockResolvedValueOnce(null);

    await expect(provider.isEnabled('unknown-flag')).resolves.toBe(false);
  });

  it('returns all flags as a key-to-enabled map', async () => {
    vi.mocked(repository.findAllFlags).mockResolvedValueOnce([
      { key: 'flag1', enabled: true },
      { key: 'flag2', enabled: false },
    ] as never);

    await expect(provider.getAllFlags()).resolves.toEqual({
      flag1: true,
      flag2: false,
    });
  });
});
