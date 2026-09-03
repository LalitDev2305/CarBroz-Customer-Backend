import { type IMapsProvider } from '../ports/IMapsProvider.js';
import { type GeocodeResult } from '../../domain/location/Location.js';
import { type IRequestContext } from '@carbroz/foundation-kernel';
import { GeocodeRequestDto } from '../dtos/maps.dto.js';

export class GeocodeAddressUseCase {
  constructor(private readonly mapsProvider: IMapsProvider) {}

  public async execute(input: { context: IRequestContext; data: GeocodeRequestDto }): Promise<GeocodeResult> {
    return this.mapsProvider.geocode(input.data.address);
  }
}
