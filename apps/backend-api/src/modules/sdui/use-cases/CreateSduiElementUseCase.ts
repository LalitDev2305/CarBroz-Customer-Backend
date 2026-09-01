import { ForbiddenError, IRequestContext, IUseCase } from '@carbroz/common';
import type { ISduiRegistryRepository, SduiElementEntity } from '@carbroz/sdui-registry';
import type { CreateSduiElementDto } from '../dtos/sdui-registry.dto.js';

export interface CreateSduiElementInput {
  context: IRequestContext;
  data: CreateSduiElementDto;
}

export class CreateSduiElementUseCase implements IUseCase<CreateSduiElementInput, SduiElementEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: CreateSduiElementInput): Promise<SduiElementEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can create SDUI elements');
    }

    return this.sduiRegistryRepository.createElement(input.data);
  }
}
