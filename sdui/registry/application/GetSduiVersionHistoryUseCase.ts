import { type SduiTargetApp } from '@carbroz/ui-sdk';
import { type ISduiRegistryRepository } from '../domain/repositories/ISduiRegistryRepository.js';
import { SduiScreenEntity } from '../domain/SduiScreen.js';
import { type IUseCase } from '@carbroz/foundation-kernel';

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
