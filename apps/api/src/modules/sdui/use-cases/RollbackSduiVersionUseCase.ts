import { IUseCase, IRequestContext, ForbiddenError } from '@carbroz/common';
import type { ISduiRegistryRepository, SduiScreenEntity } from '@carbroz/sdui-registry';
import { RollbackSduiVersionDto } from '../dtos/sdui-registry.dto.js';

export interface RollbackSduiVersionInput {
  context: IRequestContext;
  data: RollbackSduiVersionDto;
}

export class RollbackSduiVersionUseCase implements IUseCase<RollbackSduiVersionInput, SduiScreenEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: RollbackSduiVersionInput): Promise<SduiScreenEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can rollback SDUI versions');
    }

    const { screenId, targetApp = 'CUSTOMER', targetVersionNumber } = input.data;
    const publisherName = `user-${input.context.authenticatedUser.id}`;

    return await this.sduiRegistryRepository.rollbackVersion(screenId, targetApp, targetVersionNumber, publisherName);
  }
}
