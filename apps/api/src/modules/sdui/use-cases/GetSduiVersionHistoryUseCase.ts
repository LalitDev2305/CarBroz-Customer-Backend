import { ISduiRegistryRepository, IUseCase, SduiScreenEntity } from '@carbroz/common';

export interface GetSduiVersionHistoryInput {
  screenId: string;
  targetApp?: string;
}

export class GetSduiVersionHistoryUseCase implements IUseCase<GetSduiVersionHistoryInput, SduiScreenEntity[]> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: GetSduiVersionHistoryInput): Promise<SduiScreenEntity[]> {
    const { screenId, targetApp = 'CUSTOMER' } = input;
    return await this.sduiRegistryRepository.getVersionHistory(screenId, targetApp);
  }
}
