import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import type { GeocodeRequest } from '../contracts/maps.js';
import type { GeocodeResult } from '../contracts/location.js';
import type { IMapsProvider } from '../ports/IMapsProvider.js';
export interface GeocodeAddressInput { context: ExecutionContext; data: GeocodeRequest }
export class GeocodeAddressUseCase implements IUseCase<GeocodeAddressInput, GeocodeResult> {
  constructor(private readonly mapsProvider: IMapsProvider) {}
  async execute(input: GeocodeAddressInput): Promise<GeocodeResult> {
    return this.mapsProvider.geocode(input.data.address);
  }
}
