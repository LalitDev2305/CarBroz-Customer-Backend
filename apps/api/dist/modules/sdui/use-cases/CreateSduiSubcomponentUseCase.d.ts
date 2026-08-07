import { ISduiRegistryRepository, IUseCase, IRequestContext, SduiSubcomponentEntity } from '@carbroz/foundation-kernel';
import { CreateSduiSubcomponentDto } from '../dtos/sdui-registry.dto.js';
export interface CreateSduiSubcomponentInput {
    context: IRequestContext;
    data: CreateSduiSubcomponentDto;
}
export declare class CreateSduiSubcomponentUseCase implements IUseCase<CreateSduiSubcomponentInput, SduiSubcomponentEntity> {
    private readonly sduiRegistryRepository;
    constructor(sduiRegistryRepository: ISduiRegistryRepository);
    execute(input: CreateSduiSubcomponentInput): Promise<SduiSubcomponentEntity>;
}
export declare const RegisterSduiSubcomponentUseCase: typeof CreateSduiSubcomponentUseCase;
export type RegisterSduiSubcomponentInput = CreateSduiSubcomponentInput;
