import { ISduiRegistryRepository, IUseCase, IRequestContext } from '@carbroz/common';
import { ScreenFactory } from '@carbroz/ui-sdk';
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
