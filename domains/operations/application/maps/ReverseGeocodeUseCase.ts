import { type IMapsProvider } from '../ports/IMapsProvider.js';
import { type GeocodeResult } from '../../domain/location/Location.js';
import { type IRequestContext } from '@carbroz/foundation-kernel';
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
