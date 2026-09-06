
import { Coordinates, DistanceMatrixResult, GeocodeResult } from '../../domain/Location.js';

/** IMapsProvider is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IMapsProvider {
  geocode(address: string): Promise<GeocodeResult>;
  reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult>;
  calculateDistance(origin: Coordinates, destination: Coordinates): Promise<DistanceMatrixResult>;
}
