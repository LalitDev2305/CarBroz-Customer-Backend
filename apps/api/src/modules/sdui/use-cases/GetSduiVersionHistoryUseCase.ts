import { IUseCase } from '@carbroz/common';
import type { ISduiRegistryRepository, SduiScreenEntity } from '@carbroz/sdui-registry';
import type { SduiTargetApp } from '@carbroz/ui-sdk';

export interface GetSduiVersionHistoryInput {
  screenId: string;
  targetApp?: SduiTargetApp;
}

export class GetSduiVersionHistoryUseCase implements IUseCase<GetSduiVersionHistoryInput, SduiScreenEntity[]> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: GetSduiVersionHistoryInput): Promise<SduiScreenEntity[]> {
    const { screenId, targetApp = 'CUSTOMER' } = input;
    return await this.sduiRegistryRepository.getVersionHistory(screenId, targetApp);
  }
}
