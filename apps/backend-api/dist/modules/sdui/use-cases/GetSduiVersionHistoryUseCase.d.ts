import { ISduiRegistryRepository, IUseCase, SduiScreenEntity } from '@carbroz/common';
export interface GetSduiVersionHistoryInput {
    screenId: string;
    targetApp?: string;
}
export declare class GetSduiVersionHistoryUseCase implements IUseCase<GetSduiVersionHistoryInput, SduiScreenEntity[]> {
    private readonly sduiRegistryRepository;
    constructor(sduiRegistryRepository: ISduiRegistryRepository);
    execute(input: GetSduiVersionHistoryInput): Promise<SduiScreenEntity[]>;
}
