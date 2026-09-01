import { ForbiddenError, IRequestContext, IUseCase } from '@carbroz/common';
import type { ISduiRegistryRepository, SduiSectionEntity } from '@carbroz/sdui-registry';
import type { CreateSduiSectionDto } from '../dtos/sdui-registry.dto.js';

export interface CreateSduiSectionInput {
  context: IRequestContext;
  data: CreateSduiSectionDto;
}

export class CreateSduiSectionUseCase implements IUseCase<CreateSduiSectionInput, SduiSectionEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: CreateSduiSectionInput): Promise<SduiSectionEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can create SDUI sections');
    }

    return this.sduiRegistryRepository.createSection(input.data);
  }
}
