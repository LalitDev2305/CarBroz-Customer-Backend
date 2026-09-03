import { ForbiddenError, type IRequestContext, type IUseCase } from '@carbroz/foundation-kernel';
import { type ISduiRegistryRepository } from '../domain/repositories/ISduiRegistryRepository.js';
import { SduiComponentEntity } from '../domain/SduiComponent.js';
import { type CreateSduiComponentDto } from '../dtos/sdui-registry.dto.js';

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
