import { ISduiRegistryRepository, IUseCase, IRequestContext, SduiChildEntity } from '@carbroz/foundation-kernel';
import { CreateSduiChildDto } from '../dtos/sdui-registry.dto.js';
export interface CreateSduiChildInput {
    context: IRequestContext;
    data: CreateSduiChildDto;
}
export declare class CreateSduiChildUseCase implements IUseCase<CreateSduiChildInput, SduiChildEntity> {
    private readonly sduiRegistryRepository;
    constructor(sduiRegistryRepository: ISduiRegistryRepository);
    execute(input: CreateSduiChildInput): Promise<SduiChildEntity>;
}
export declare const RegisterSduiChildUseCase: typeof CreateSduiChildUseCase;
export type RegisterSduiChildInput = CreateSduiChildInput;
