import { type SduiTargetApp } from '@carbroz/ui-sdk';
import { type ISduiRegistryRepository } from '../domain/repositories/ISduiRegistryRepository.js';
import { SduiScreenEntity } from '../domain/SduiScreen.js';
import { type IUseCase, NotFoundError } from '@carbroz/foundation-kernel';

export interface GetSduiSpecificVersionInput {
  screenId: string;
  targetApp?: SduiTargetApp;
  versionNumber: number;
}

export class GetSduiSpecificVersionUseCase implements IUseCase<GetSduiSpecificVersionInput, SduiScreenEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: GetSduiSpecificVersionInput): Promise<SduiScreenEntity> {
    const { screenId, targetApp = 'CUSTOMER', versionNumber } = input;
    const version = await this.sduiRegistryRepository.getSpecificVersion(screenId, targetApp, versionNumber);

    if (!version) {
      throw new NotFoundError(`Screen version ${versionNumber} not found for screen '${screenId}'`);
    }

    return version;
  }
}
