import { ISduiRegistryRepository, IUseCase, IRequestContext, ForbiddenError, SduiScreenEntity } from '@carbroz/common';
import { PublishSduiVersionDto } from '../dtos/sdui-registry.dto.js';

export interface PublishSduiVersionInput {
  context: IRequestContext;
  data: PublishSduiVersionDto;
}

export class PublishSduiVersionUseCase implements IUseCase<PublishSduiVersionInput, SduiScreenEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: PublishSduiVersionInput): Promise<SduiScreenEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can publish SDUI versions');
    }

    const { screenId, targetApp = 'CUSTOMER', versionNumber } = input.data;
    const publisherName = `user-${input.context.authenticatedUser.id}`;

    return await this.sduiRegistryRepository.publishVersion(screenId, targetApp, versionNumber, publisherName);
  }
}
