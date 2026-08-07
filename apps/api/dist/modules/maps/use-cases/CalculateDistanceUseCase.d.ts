import { IMapsProvider, IRequestContext, DistanceMatrixResult } from '@carbroz/foundation-kernel';
import { CalculateDistanceRequestDto } from '../dtos/maps.dto.js';
export declare class CalculateDistanceUseCase {
    private readonly mapsProvider;
    constructor(mapsProvider: IMapsProvider);
    execute(input: {
        context: IRequestContext;
        data: CalculateDistanceRequestDto;
    }): Promise<DistanceMatrixResult>;
}
