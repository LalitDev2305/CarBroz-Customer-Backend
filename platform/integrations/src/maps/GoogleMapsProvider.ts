import { IMapsProvider, Coordinates, GeocodeResult, DistanceMatrixResult } from '@carbroz/domain-operations';
import { ILoggerProvider } from '@carbroz/platform-observability';

/** GoogleMapsProvider is an exported platform/integrations contract/implementation; see the owning README for lifecycle and extension rules. */
export class GoogleMapsProvider implements IMapsProvider {
  constructor(private readonly logger: ILoggerProvider) {}

  public async init(): Promise<void> {
    this.logger.info('GoogleMapsProvider initialized', { module: 'GoogleMapsProvider' });
  }

  public async shutdown(): Promise<void> {
    this.logger.info('GoogleMapsProvider shut down', { module: 'GoogleMapsProvider' });
  }

  private isDevelopmentMockMode(): boolean {
    const apiKey = process.env.MAPS_API_KEY?.trim().toLowerCase();
    return process.env.NODE_ENV !== 'production' && (!apiKey || apiKey === 'mock');
  }

  private failForUnavailableRealProvider(): never {
    this.logger.warn('Real Maps API is not yet implemented.', { module: 'GoogleMapsProvider' });
    throw new Error('Google Maps provider integration is not implemented');
  }

  public async geocode(address: string): Promise<GeocodeResult> {
    if (this.isDevelopmentMockMode()) {
      this.logger.debug('Mocking geocode request', { module: 'GoogleMapsProvider', address });
      return {
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        address: {
          formattedAddress: `Mocked Address for: ${address}`,
          city: 'Mock City',
          country: 'Mock Country'
        }
      };
    }

    return this.failForUnavailableRealProvider();
  }

  public async reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult> {
    if (this.isDevelopmentMockMode()) {
      this.logger.debug('Mocking reverseGeocode request', { module: 'GoogleMapsProvider', coordinates });
      return {
        coordinates,
        address: {
          formattedAddress: `Mocked Address at ${coordinates.latitude}, ${coordinates.longitude}`,
          city: 'Mock City',
          country: 'Mock Country'
        }
      };
    }

    return this.failForUnavailableRealProvider();
  }

  public async calculateDistance(origin: Coordinates, destination: Coordinates): Promise<DistanceMatrixResult> {
    if (this.isDevelopmentMockMode()) {
      this.logger.debug('Mocking calculateDistance request', { module: 'GoogleMapsProvider', origin, destination });
      const R = 6371e3;
      const φ1 = origin.latitude * Math.PI / 180;
      const φ2 = destination.latitude * Math.PI / 180;
      const Δφ = (destination.latitude - origin.latitude) * Math.PI / 180;
      const Δλ = (destination.longitude - origin.longitude) * Math.PI / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
        + Math.cos(φ1) * Math.cos(φ2)
        * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return {
        distanceInMeters: Math.round(distance),
        durationInSeconds: Math.round(distance / 10)
      };
    }

    return this.failForUnavailableRealProvider();
  }
}
