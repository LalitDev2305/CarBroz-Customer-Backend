import { describe, expect, it } from 'vitest';
import { isDetailedDiagnosticLoggingEnabled } from './diagnostic-mode.js';

describe('diagnostic console environment gate', () => {
  it('enables detailed diagnostics for development', () => {
    expect(isDetailedDiagnosticLoggingEnabled({ CARBROZ_ENVIRONMENT: 'development', NODE_ENV: 'production' })).toBe(true);
  });

  it('enables detailed diagnostics for staging while NODE_ENV remains production', () => {
    expect(isDetailedDiagnosticLoggingEnabled({ CARBROZ_ENVIRONMENT: 'staging', NODE_ENV: 'production' })).toBe(true);
  });

  it('disables detailed diagnostics for production', () => {
    expect(isDetailedDiagnosticLoggingEnabled({ CARBROZ_ENVIRONMENT: 'production', NODE_ENV: 'development' })).toBe(false);
  });

  it('keeps test silent when no explicit CarBroz environment is supplied', () => {
    expect(isDetailedDiagnosticLoggingEnabled({ NODE_ENV: 'test' })).toBe(false);
  });

  it('uses NODE_ENV development as the local backwards-compatible default', () => {
    expect(isDetailedDiagnosticLoggingEnabled({ NODE_ENV: 'development' })).toBe(true);
  });
});
