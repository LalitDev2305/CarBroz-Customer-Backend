import { ISduiRegistryRepository, IUseCase, IRequestContext, SduiComponentRegistryEntity } from '@carbroz/common';
import { RegisterSduiComponentDto } from '../dtos/sdui-registry.dto.js';
export interface RegisterSduiComponentInput {
    context: IRequestContext;
    data: RegisterSduiComponentDto;
}
export declare class RegisterSduiComponentUseCase implements IUseCase<RegisterSduiComponentInput, SduiComponentRegistryEntity> {
    private readonly sduiRegistryRepository;
    constructor(sduiRegistryRepository: ISduiRegistryRepository);
    execute(input: RegisterSduiComponentInput): Promise<SduiComponentRegistryEntity>;
}
