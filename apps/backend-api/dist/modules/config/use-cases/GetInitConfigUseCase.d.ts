import { IConfigProvider, IFeatureFlagProvider } from '@carbroz/common';
import { InitConfigResponseDto } from '../dtos/config.dto.js';
export declare class GetInitConfigUseCase {
    private configProvider;
    private featureFlagProvider;
    constructor(configProvider: IConfigProvider, featureFlagProvider: IFeatureFlagProvider);
    execute(): Promise<InitConfigResponseDto>;
}
