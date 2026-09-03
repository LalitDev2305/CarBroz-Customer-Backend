import { ForbiddenError, type IRequestContext, type IUseCase } from '@carbroz/foundation-kernel';
import { type ISduiRegistryRepository } from '../domain/repositories/ISduiRegistryRepository.js';
import { SduiGroupEntity } from '../domain/SduiGroup.js';
import { type CreateSduiGroupDto } from '../dtos/sdui-registry.dto.js';

export interface CreateSduiGroupInput {
  context: IRequestContext;
  data: CreateSduiGroupDto;
}

export class CreateSduiGroupUseCase implements IUseCase<CreateSduiGroupInput, SduiGroupEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: CreateSduiGroupInput): Promise<SduiGroupEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can create SDUI groups');
    }

    return this.sduiRegistryRepository.createGroup(input.data);
  }
}
