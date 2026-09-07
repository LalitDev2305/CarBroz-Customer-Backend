import { ILoggerProvider } from '@carbroz/platform-observability';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GoogleMapsProvider } from './GoogleMapsProvider.js';

describe('GoogleMapsProvider', () => {
  let provider: GoogleMapsProvider;
  let mockLogger: ILoggerProvider;

  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('MAPS_API_KEY', 'mock');

    mockLogger = {
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as ILoggerProvider;

    provider = new GoogleMapsProvider(mockLogger);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('should geocode address using mock mode outside production', async () => {
    const result = await provider.geocode('123 Main St');
    expect(result.coordinates.latitude).toBeDefined();
    expect(result.address.formattedAddress).toContain('123 Main St');
  });

  it('should reverse geocode coordinates using mock mode outside production', async () => {
    const result = await provider.reverseGeocode({ latitude: 10, longitude: 20 });
    expect(result.address.formattedAddress).toContain('10');
    expect(result.address.formattedAddress).toContain('20');
  });

  it('should calculate distance using haversine in mock mode outside production', async () => {
    const london = { latitude: 51.5074, longitude: -0.1278 };
    const paris = { latitude: 48.8566, longitude: 2.3522 };

    const result = await provider.calculateDistance(london, paris);
    expect(result.distanceInMeters).toBeGreaterThan(340000);
    expect(result.distanceInMeters).toBeLessThan(350000);
    expect(result.durationInSeconds).toBeDefined();
  });

  it('does not silently fall back to mock behavior in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MAPS_API_KEY', 'real-provider-key');
    provider = new GoogleMapsProvider(mockLogger);

    await expect(provider.geocode('123 Main St'))
      .rejects.toThrow('Google Maps provider integration is not implemented');
    expect(mockLogger.debug).not.toHaveBeenCalled();
  });
});
