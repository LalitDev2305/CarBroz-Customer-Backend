import { ForbiddenError, IRequestContext, IUseCase } from '@carbroz/common';
import type { ISduiRegistryRepository, SduiComponentEntity } from '@carbroz/domain-sdui-registry';
import type { CreateSduiComponentDto } from '../dtos/sdui-registry.dto.js';

export interface CreateSduiComponentInput {
  context: IRequestContext;
  data: CreateSduiComponentDto;
}

export class CreateSduiComponentUseCase implements IUseCase<CreateSduiComponentInput, SduiComponentEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: CreateSduiComponentInput): Promise<SduiComponentEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can create SDUI components');
    }

    return this.sduiRegistryRepository.createComponent(input.data);
  }
}
