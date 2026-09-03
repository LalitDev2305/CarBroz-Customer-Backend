import { type IConfigProvider, type ILoggerProvider } from '@carbroz/foundation-kernel';
import { type IMapsProvider, type Coordinates, type GeocodeResult, type DistanceMatrixResult } from '@carbroz/domain-operations';

export class GoogleMapsProvider implements IMapsProvider {
  constructor(
    private readonly configProvider: IConfigProvider,
    private readonly logger: ILoggerProvider
  ) {}

  public async init(): Promise<void> {
    this.logger.info('GoogleMapsProvider initialized', { module: 'GoogleMapsProvider' });
  }

  public async shutdown(): Promise<void> {
    this.logger.info('GoogleMapsProvider shut down', { module: 'GoogleMapsProvider' });
  }

  private async isMockMode(): Promise<boolean> {
    const apiKey = await this.configProvider.get('MAPS_API_KEY') as string | undefined;
    return !apiKey || apiKey === 'mock';
  }

  public async geocode(address: string): Promise<GeocodeResult> {
    if (await this.isMockMode()) {
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

    this.logger.warn('Real Maps API not yet implemented. Falling back to mock.', { module: 'GoogleMapsProvider' });
    // TODO: Implement actual Google Maps geocoding
    return {
      coordinates: { latitude: 0, longitude: 0 },
      address: { formattedAddress: 'Not implemented' }
    };
  }

  public async reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult> {
    if (await this.isMockMode()) {
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

    this.logger.warn('Real Maps API not yet implemented. Falling back to mock.', { module: 'GoogleMapsProvider' });
    return {
      coordinates,
      address: { formattedAddress: 'Not implemented' }
    };
  }

  public async calculateDistance(origin: Coordinates, destination: Coordinates): Promise<DistanceMatrixResult> {
    if (await this.isMockMode()) {
      this.logger.debug('Mocking calculateDistance request', { module: 'GoogleMapsProvider', origin, destination });
      // Simple haversine mock approximation
      const R = 6371e3; // metres
      const φ1 = origin.latitude * Math.PI/180;
      const φ2 = destination.latitude * Math.PI/180;
      const Δφ = (destination.latitude-origin.latitude) * Math.PI/180;
      const Δλ = (destination.longitude-origin.longitude) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      return {
        distanceInMeters: Math.round(distance),
        durationInSeconds: Math.round(distance / 10) // Mock duration: 10m/s speed
      };
    }

    this.logger.warn('Real Maps API not yet implemented. Falling back to mock.', { module: 'GoogleMapsProvider' });
    return { distanceInMeters: 0, durationInSeconds: 0 };
  }
}
