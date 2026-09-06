import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import type { ReverseGeocodeRequest } from '../contracts/maps.js';
import type { GeocodeResult } from '../contracts/location.js';
import type { IMapsProvider } from '../ports/IMapsProvider.js';
export interface ReverseGeocodeInput { context: ExecutionContext; data: ReverseGeocodeRequest }
export class ReverseGeocodeUseCase implements IUseCase<ReverseGeocodeInput, GeocodeResult> {
  constructor(private readonly mapsProvider: IMapsProvider) {}
  async execute(input: ReverseGeocodeInput): Promise<GeocodeResult> {
    return this.mapsProvider.reverseGeocode({ latitude: input.data.lat, longitude: input.data.lng });
  }
}
