import { ISduiRegistryRepository, IUseCase, IRequestContext, SduiScreenEntity } from '@carbroz/foundation-kernel';
import { ArchiveSduiVersionDto } from '../dtos/sdui-registry.dto.js';
export interface ArchiveSduiVersionInput {
    context: IRequestContext;
    data: ArchiveSduiVersionDto;
}
export declare class ArchiveSduiVersionUseCase implements IUseCase<ArchiveSduiVersionInput, SduiScreenEntity> {
    private readonly sduiRegistryRepository;
    constructor(sduiRegistryRepository: ISduiRegistryRepository);
    execute(input: ArchiveSduiVersionInput): Promise<SduiScreenEntity>;
}
