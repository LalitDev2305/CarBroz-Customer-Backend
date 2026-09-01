import { IMapsProvider, IRequestContext, GeocodeResult } from '@carbroz/common';
import { GeocodeRequestDto } from '../dtos/maps.dto.js';

export class GeocodeAddressUseCase {
  constructor(private readonly mapsProvider: IMapsProvider) {}

  public async execute(input: { context: IRequestContext; data: GeocodeRequestDto }): Promise<GeocodeResult> {
    return this.mapsProvider.geocode(input.data.address);
  }
}
