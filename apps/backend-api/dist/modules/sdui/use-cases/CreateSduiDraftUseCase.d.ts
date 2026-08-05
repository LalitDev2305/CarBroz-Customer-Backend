import { ISduiRegistryRepository, IUseCase, IRequestContext, SduiScreenEntity } from '@carbroz/common';
import { CreateSduiDraftDto } from '../dtos/sdui-registry.dto.js';
export interface CreateSduiDraftInput {
    context: IRequestContext;
    data: CreateSduiDraftDto;
}
export declare class CreateSduiDraftUseCase implements IUseCase<CreateSduiDraftInput, SduiScreenEntity> {
    private readonly sduiRegistryRepository;
    constructor(sduiRegistryRepository: ISduiRegistryRepository);
    execute(input: CreateSduiDraftInput): Promise<SduiScreenEntity>;
}
