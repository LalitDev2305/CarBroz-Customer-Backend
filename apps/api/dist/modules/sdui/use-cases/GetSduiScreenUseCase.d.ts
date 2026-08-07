import { ISduiRegistryRepository, IUseCase, IRequestContext } from '@carbroz/foundation-kernel';
import { ScreenFactory } from '@carbroz/sdui-engine';
import { GetSduiScreenDto, SduiJsonContract } from '../dtos/sdui-registry.dto.js';
export interface GetSduiScreenInput {
    context?: IRequestContext;
    data: GetSduiScreenDto;
}
export declare class GetSduiScreenUseCase implements IUseCase<GetSduiScreenInput, SduiJsonContract> {
    private readonly sduiRegistryRepository;
    private readonly screenFactory;
    constructor(sduiRegistryRepository: ISduiRegistryRepository, screenFactory: ScreenFactory);
    execute(input: GetSduiScreenInput): Promise<SduiJsonContract>;
}
