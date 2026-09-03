import { type IMapsProvider } from '../ports/IMapsProvider.js';
import { type DistanceMatrixResult } from '../../domain/location/Location.js';
import { type IRequestContext } from '@carbroz/foundation-kernel';
import { CalculateDistanceRequestDto } from '../dtos/maps.dto.js';

export class CalculateDistanceUseCase {
  constructor(private readonly mapsProvider: IMapsProvider) {}

  public async execute(input: { context: IRequestContext; data: CalculateDistanceRequestDto }): Promise<DistanceMatrixResult> {
    return this.mapsProvider.calculateDistance(
      { latitude: input.data.originLat, longitude: input.data.originLng },
      { latitude: input.data.destLat, longitude: input.data.destLng }
    );
  }
}
