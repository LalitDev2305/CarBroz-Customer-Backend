import { ISduiRegistryRepository, IUseCase, IRequestContext, SduiScreenEntity } from '@carbroz/foundation-kernel';
import { UpdateSduiScreenDto } from '../dtos/sdui-registry.dto.js';
export interface UpdateSduiScreenLayoutInput {
    context: IRequestContext;
    data: UpdateSduiScreenDto;
}
export declare class UpdateSduiScreenLayoutUseCase implements IUseCase<UpdateSduiScreenLayoutInput, SduiScreenEntity> {
    private readonly sduiRegistryRepository;
    constructor(sduiRegistryRepository: ISduiRegistryRepository);
    execute(input: UpdateSduiScreenLayoutInput): Promise<SduiScreenEntity>;
}
