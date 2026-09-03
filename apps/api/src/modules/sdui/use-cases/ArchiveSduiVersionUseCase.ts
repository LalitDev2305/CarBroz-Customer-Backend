import { IUseCase, IRequestContext, ForbiddenError } from '@carbroz/common';
import type { ISduiRegistryRepository, SduiScreenEntity } from '@carbroz/sdui-registry';
import { ArchiveSduiVersionDto } from '../dtos/sdui-registry.dto.js';

export interface ArchiveSduiVersionInput {
  context: IRequestContext;
  data: ArchiveSduiVersionDto;
}

export class ArchiveSduiVersionUseCase implements IUseCase<ArchiveSduiVersionInput, SduiScreenEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: ArchiveSduiVersionInput): Promise<SduiScreenEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can archive SDUI versions');
    }

    const { screenId, targetApp = 'CUSTOMER', versionNumber } = input.data;

    return await this.sduiRegistryRepository.archiveVersion(screenId, targetApp, versionNumber);
  }
}
