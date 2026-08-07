import { ISduiRegistryRepository, IUseCase, IRequestContext, SduiChildrenDataEntity } from '@carbroz/foundation-kernel';
import { CreateSduiChildrenDataDto } from '../dtos/sdui-registry.dto.js';
export interface CreateSduiChildrenDataInput {
    context: IRequestContext;
    data: CreateSduiChildrenDataDto;
}
export declare class CreateSduiChildrenDataUseCase implements IUseCase<CreateSduiChildrenDataInput, SduiChildrenDataEntity> {
    private readonly sduiRegistryRepository;
    constructor(sduiRegistryRepository: ISduiRegistryRepository);
    execute(input: CreateSduiChildrenDataInput): Promise<SduiChildrenDataEntity>;
}
export declare const RegisterSduiChildrenDataUseCase: typeof CreateSduiChildrenDataUseCase;
export type RegisterSduiChildrenDataInput = CreateSduiChildrenDataInput;
