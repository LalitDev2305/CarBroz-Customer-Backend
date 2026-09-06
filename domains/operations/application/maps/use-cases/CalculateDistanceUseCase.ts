import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import type { CalculateDistanceRequest } from '../contracts/maps.js';
import type { DistanceMatrixResult } from '../contracts/location.js';
import type { IMapsProvider } from '../ports/IMapsProvider.js';
export interface CalculateDistanceInput { context: ExecutionContext; data: CalculateDistanceRequest }
export class CalculateDistanceUseCase implements IUseCase<CalculateDistanceInput, DistanceMatrixResult> {
  constructor(private readonly mapsProvider: IMapsProvider) {}
  async execute(input: CalculateDistanceInput): Promise<DistanceMatrixResult> {
    return this.mapsProvider.calculateDistance(
      { latitude: input.data.originLat, longitude: input.data.originLng },
      { latitude: input.data.destLat, longitude: input.data.destLng },
    );
  }
}
