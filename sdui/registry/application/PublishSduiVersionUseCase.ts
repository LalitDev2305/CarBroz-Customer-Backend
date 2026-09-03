import { type ISduiRegistryRepository } from '../domain/repositories/ISduiRegistryRepository.js';
import { SduiScreenEntity } from '../domain/SduiScreen.js';
import { type IUseCase, type IRequestContext, ForbiddenError } from '@carbroz/foundation-kernel';
import { type PublishSduiVersionDto } from '../dtos/sdui-registry.dto.js';

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
