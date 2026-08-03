import { IMapsProvider, IRequestContext, GeocodeResult } from '@carbroz/common';
import { GeocodeRequestDto } from '../dtos/maps.dto.js';
export declare class GeocodeAddressUseCase {
    private readonly mapsProvider;
    constructor(mapsProvider: IMapsProvider);
    execute(input: {
        context: IRequestContext;
        data: GeocodeRequestDto;
    }): Promise<GeocodeResult>;
}
