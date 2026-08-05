import { ISduiRegistryRepository, IUseCase, IRequestContext, SduiScreenEntity } from '@carbroz/common';
import { RollbackSduiVersionDto } from '../dtos/sdui-registry.dto.js';
export interface RollbackSduiVersionInput {
    context: IRequestContext;
    data: RollbackSduiVersionDto;
}
export declare class RollbackSduiVersionUseCase implements IUseCase<RollbackSduiVersionInput, SduiScreenEntity> {
    private readonly sduiRegistryRepository;
    constructor(sduiRegistryRepository: ISduiRegistryRepository);
    execute(input: RollbackSduiVersionInput): Promise<SduiScreenEntity>;
}
