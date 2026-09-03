import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeocodeAddressUseCase } from './GeocodeAddressUseCase.js';
import { ReverseGeocodeUseCase } from './ReverseGeocodeUseCase.js';
import { CalculateDistanceUseCase } from './CalculateDistanceUseCase.js';
import { type IMapsProvider } from '../ports/IMapsProvider.js';
import { type IRequestContext } from '@carbroz/foundation-kernel';

describe('Maps Use Cases', () => {
  let mockProvider: IMapsProvider;
  let context: IRequestContext;

  beforeEach(() => {
    mockProvider = {
      geocode: vi.fn(),
      reverseGeocode: vi.fn(),
      calculateDistance: vi.fn()
    } as unknown as IMapsProvider;

    context = {
      traceId: 'test-trace',
      authenticatedUser: { id: 'user-1' }
    } as any;
  });

  it('GeocodeAddressUseCase should call geocode on provider', async () => {
    const useCase = new GeocodeAddressUseCase(mockProvider);
    vi.mocked(mockProvider.geocode).mockResolvedValue({
      coordinates: { latitude: 10, longitude: 20 },
      address: {}
    });

    const result = await useCase.execute({ context, data: { address: '123 Main' } });
    expect(mockProvider.geocode).toHaveBeenCalledWith('123 Main');
    expect(result.coordinates.latitude).toBe(10);
  });

  it('ReverseGeocodeUseCase should call reverseGeocode on provider', async () => {
    const useCase = new ReverseGeocodeUseCase(mockProvider);
    vi.mocked(mockProvider.reverseGeocode).mockResolvedValue({
      coordinates: { latitude: 10, longitude: 20 },
      address: {}
    });

    const result = await useCase.execute({ context, data: { lat: 10, lng: 20 } });
    expect(mockProvider.reverseGeocode).toHaveBeenCalledWith({ latitude: 10, longitude: 20 });
    expect(result.coordinates.latitude).toBe(10);
  });

  it('CalculateDistanceUseCase should call calculateDistance on provider', async () => {
    const useCase = new CalculateDistanceUseCase(mockProvider);
    vi.mocked(mockProvider.calculateDistance).mockResolvedValue({
      distanceInMeters: 500,
      durationInSeconds: 60
    });

    const result = await useCase.execute({ 
      context, 
      data: { originLat: 10, originLng: 20, destLat: 30, destLng: 40 } 
    });
    expect(mockProvider.calculateDistance).toHaveBeenCalledWith(
      { latitude: 10, longitude: 20 },
      { latitude: 30, longitude: 40 }
    );
    expect(result.distanceInMeters).toBe(500);
  });
});
