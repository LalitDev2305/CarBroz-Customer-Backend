import { type IProvider } from '@carbroz/foundation-kernel';
import { type Coordinates, type DistanceMatrixResult, type GeocodeResult } from '../../domain/location/Location.js';

export interface IMapsProvider extends IProvider {
  geocode(address: string): Promise<GeocodeResult>;
  reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult>;
  calculateDistance(origin: Coordinates, destination: Coordinates): Promise<DistanceMatrixResult>;
}
