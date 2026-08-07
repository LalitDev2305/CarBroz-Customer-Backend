import { ISduiRegistryRepository, IUseCase, SduiScreenEntity } from '@carbroz/foundation-kernel';
import { CompareSduiVersionsDto } from '../dtos/sdui-registry.dto.js';
export interface CompareSduiVersionsResult {
    screenId: string;
    targetApp: string;
    sourceVersion: SduiScreenEntity;
    targetVersion: SduiScreenEntity;
    comparisonSummary: {
        isIdentical: boolean;
        templateTypeChanged: boolean;
        componentsCountDelta: number;
        subcomponentsCountDelta: number;
    };
}
export declare class CompareSduiVersionsUseCase implements IUseCase<CompareSduiVersionsDto, CompareSduiVersionsResult> {
    private readonly sduiRegistryRepository;
    constructor(sduiRegistryRepository: ISduiRegistryRepository);
    execute(input: CompareSduiVersionsDto): Promise<CompareSduiVersionsResult>;
}
