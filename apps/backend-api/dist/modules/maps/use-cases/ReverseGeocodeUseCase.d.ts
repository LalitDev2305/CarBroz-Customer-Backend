import { IMapsProvider, IRequestContext, GeocodeResult } from '@carbroz/common';
import { ReverseGeocodeRequestDto } from '../dtos/maps.dto.js';
export declare class ReverseGeocodeUseCase {
    private readonly mapsProvider;
    constructor(mapsProvider: IMapsProvider);
    execute(input: {
        context: IRequestContext;
        data: ReverseGeocodeRequestDto;
    }): Promise<GeocodeResult>;
}
