import { ISduiRegistryRepository, IUseCase, IRequestContext, SduiScreenEntity } from '@carbroz/common';
import { PublishSduiVersionDto } from '../dtos/sdui-registry.dto.js';
export interface PublishSduiVersionInput {
    context: IRequestContext;
    data: PublishSduiVersionDto;
}
export declare class PublishSduiVersionUseCase implements IUseCase<PublishSduiVersionInput, SduiScreenEntity> {
    private readonly sduiRegistryRepository;
    constructor(sduiRegistryRepository: ISduiRegistryRepository);
    execute(input: PublishSduiVersionInput): Promise<SduiScreenEntity>;
}
