import { describe, expect, it } from 'vitest';
import { AppBootstrapInternals } from '../use-cases/GetAppBootstrapUseCase.js';

describe('AppBootstrapInternals', () => {
  it('builds the same config version regardless of object key insertion order', () => {
    const first = {
      branding: { secondary: 'b', primary: 'a' },
      application: { name: 'CarBroz Partner' },
      legal: { privacy: '/privacy', terms: '/terms' },
    };
    const second = {
      legal: { terms: '/terms', privacy: '/privacy' },
      application: { name: 'CarBroz Partner' },
      branding: { primary: 'a', secondary: 'b' },
    };

    expect(AppBootstrapInternals.buildConfigVersion(first))
      .toBe(AppBootstrapInternals.buildConfigVersion(second));
  });

  it('changes the version when cacheable public configuration changes', () => {
    const first = AppBootstrapInternals.buildConfigVersion({ application: { name: 'CarBroz Partner' } });
    const second = AppBootstrapInternals.buildConfigVersion({ application: { name: 'CarBroz Partner Pro' } });

    expect(first).not.toBe(second);
    expect(first).toMatch(/^cfg_[a-f0-9]{64}$/);
  });
});
