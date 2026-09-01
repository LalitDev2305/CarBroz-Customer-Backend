import { ForbiddenError, IRequestContext, IUseCase } from '@carbroz/common';
import type { ISduiRegistryRepository, SduiGroupEntity } from '@carbroz/domain-sdui-registry';
import type { CreateSduiGroupDto } from '../dtos/sdui-registry.dto.js';

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
