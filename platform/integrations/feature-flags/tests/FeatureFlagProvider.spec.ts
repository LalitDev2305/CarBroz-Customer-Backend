import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeatureFlagProvider } from '../src/providers/FeatureFlagProvider.js';
import { type IFeatureFlagRepository } from '@carbroz/domain-configuration';

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

  it('should return true if flag is enabled', async () => {
    (repository.findByKey as any).mockResolvedValueOnce({ enabled: true });
    const result = await provider.isEnabled('test-flag');
    expect(result).toBe(true);
    expect(repository.findByKey).toHaveBeenCalledWith('test-flag');
  });

  it('should return false if flag is disabled', async () => {
    (repository.findByKey as any).mockResolvedValueOnce({ enabled: false });
    const result = await provider.isEnabled('test-flag');
    expect(result).toBe(false);
  });

  it('should return false if flag does not exist', async () => {
    (repository.findByKey as any).mockResolvedValueOnce(null);
    const result = await provider.isEnabled('unknown-flag');
    expect(result).toBe(false);
  });

  it('should get all flags', async () => {
    (repository.findAllFlags as any).mockResolvedValueOnce([
      { key: 'flag1', enabled: true },
      { key: 'flag2', enabled: false }
    ]);
    const result = await provider.getAllFlags();
    expect(result).toEqual({
      flag1: true,
      flag2: false
    });
  });
});
