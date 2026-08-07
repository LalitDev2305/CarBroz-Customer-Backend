import { ISduiRegistryRepository, IUseCase, IRequestContext, SduiScreenEntity } from '@carbroz/foundation-kernel';
import { UpdateSduiDraftDto } from '../dtos/sdui-registry.dto.js';
export interface UpdateSduiDraftInput {
    context: IRequestContext;
    data: UpdateSduiDraftDto;
}
export declare class UpdateSduiDraftUseCase implements IUseCase<UpdateSduiDraftInput, SduiScreenEntity> {
    private readonly sduiRegistryRepository;
    constructor(sduiRegistryRepository: ISduiRegistryRepository);
    execute(input: UpdateSduiDraftInput): Promise<SduiScreenEntity>;
}
