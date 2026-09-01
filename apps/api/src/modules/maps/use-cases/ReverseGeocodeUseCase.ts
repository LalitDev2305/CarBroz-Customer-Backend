import { IMapsProvider, IRequestContext, GeocodeResult } from '@carbroz/common';
import { ReverseGeocodeRequestDto } from '../dtos/maps.dto.js';

export class ReverseGeocodeUseCase {
  constructor(private readonly mapsProvider: IMapsProvider) {}

  public async execute(input: { context: IRequestContext; data: ReverseGeocodeRequestDto }): Promise<GeocodeResult> {
    return this.mapsProvider.reverseGeocode({
      latitude: input.data.lat,
      longitude: input.data.lng
    });
  }
}
