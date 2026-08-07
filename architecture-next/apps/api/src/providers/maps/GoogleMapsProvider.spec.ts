import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleMapsProvider } from './GoogleMapsProvider.js';
import { IConfigProvider, ILoggerProvider } from '@carbroz/common';

describe('GoogleMapsProvider', () => {
  let provider: GoogleMapsProvider;
  let mockConfig: IConfigProvider;
  let mockLogger: ILoggerProvider;

  beforeEach(() => {
    mockConfig = {
      get: vi.fn().mockReturnValue('mock'),
      getRequired: vi.fn(),
      getAll: vi.fn(),
    } as unknown as IConfigProvider;

    mockLogger = {
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as ILoggerProvider;

    provider = new GoogleMapsProvider(mockConfig, mockLogger);
  });

  it('should geocode address using mock mode', async () => {
    const result = await provider.geocode('123 Main St');
    expect(result.coordinates.latitude).toBeDefined();
    expect(result.address.formattedAddress).toContain('123 Main St');
  });

  it('should reverse geocode coordinates using mock mode', async () => {
    const result = await provider.reverseGeocode({ latitude: 10, longitude: 20 });
    expect(result.address.formattedAddress).toContain('10');
    expect(result.address.formattedAddress).toContain('20');
  });

  it('should calculate distance using haversine in mock mode', async () => {
    // London to Paris coordinates (approx 344km)
    const london = { latitude: 51.5074, longitude: -0.1278 };
    const paris = { latitude: 48.8566, longitude: 2.3522 };
    
    const result = await provider.calculateDistance(london, paris);
    // Haversine should be roughly 343km
    expect(result.distanceInMeters).toBeGreaterThan(340000);
    expect(result.distanceInMeters).toBeLessThan(350000);
    expect(result.durationInSeconds).toBeDefined();
  });
});
