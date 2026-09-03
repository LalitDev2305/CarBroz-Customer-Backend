import { IUseCase, NotFoundError } from '@carbroz/common';
import type { ISduiRegistryRepository, SduiScreenEntity } from '@carbroz/sdui-registry';
import type { SduiTargetApp } from '@carbroz/ui-sdk';

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
