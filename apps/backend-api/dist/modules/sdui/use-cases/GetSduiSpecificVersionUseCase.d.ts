import { ISduiRegistryRepository, IUseCase, SduiScreenEntity } from '@carbroz/common';
export interface GetSduiSpecificVersionInput {
    screenId: string;
    targetApp?: string;
    versionNumber: number;
}
export declare class GetSduiSpecificVersionUseCase implements IUseCase<GetSduiSpecificVersionInput, SduiScreenEntity> {
    private readonly sduiRegistryRepository;
    constructor(sduiRegistryRepository: ISduiRegistryRepository);
    execute(input: GetSduiSpecificVersionInput): Promise<SduiScreenEntity>;
}
