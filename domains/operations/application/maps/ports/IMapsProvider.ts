import type { Coordinates, DistanceMatrixResult, GeocodeResult } from '../contracts/location.js';
export interface IMapsProvider {
  geocode(address: string): Promise<GeocodeResult>;
  reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult>;
  calculateDistance(origin: Coordinates, destination: Coordinates): Promise<DistanceMatrixResult>;
}
