import { IProvider } from './IProvider.js';
import { Coordinates, DistanceMatrixResult, GeocodeResult } from '../domain/models/Location.js';
export interface IMapsProvider extends IProvider {
    geocode(address: string): Promise<GeocodeResult>;
    reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult>;
    calculateDistance(origin: Coordinates, destination: Coordinates): Promise<DistanceMatrixResult>;
}
