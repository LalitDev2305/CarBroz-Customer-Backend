import { ISduiRegistryRepository, IUseCase, IRequestContext, SduiComponentEntity } from '@carbroz/common';
import { CreateSduiComponentDto } from '../dtos/sdui-registry.dto.js';
export interface CreateSduiComponentInput {
    context: IRequestContext;
    data: CreateSduiComponentDto;
}
export declare class CreateSduiComponentUseCase implements IUseCase<CreateSduiComponentInput, SduiComponentEntity> {
    private readonly sduiRegistryRepository;
    constructor(sduiRegistryRepository: ISduiRegistryRepository);
    execute(input: CreateSduiComponentInput): Promise<SduiComponentEntity>;
}
export declare const RegisterSduiComponentUseCase: typeof CreateSduiComponentUseCase;
export type RegisterSduiComponentInput = CreateSduiComponentInput;
