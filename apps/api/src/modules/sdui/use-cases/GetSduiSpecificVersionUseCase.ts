import { ISduiRegistryRepository, IUseCase, NotFoundError, SduiScreenEntity } from '@carbroz/common';

export interface GetSduiSpecificVersionInput {
  screenId: string;
  targetApp?: string;
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
