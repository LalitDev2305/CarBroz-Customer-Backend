import { ISduiRegistryRepository, IUseCase, IRequestContext, ForbiddenError, SduiChildEntity } from '@carbroz/common';
import { CreateSduiChildDto } from '../dtos/sdui-registry.dto.js';

export interface CreateSduiChildInput {
  context: IRequestContext;
  data: CreateSduiChildDto;
}

export class CreateSduiChildUseCase implements IUseCase<CreateSduiChildInput, SduiChildEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: CreateSduiChildInput): Promise<SduiChildEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can create SDUI children');
    }

    const { name, componentType, schemaJson, supportedProperties, supportedActions } = input.data;
    return await this.sduiRegistryRepository.createChild(
      name,
      componentType,
      schemaJson,
      supportedProperties,
      supportedActions
    );
  }
}

export const RegisterSduiChildUseCase = CreateSduiChildUseCase;
export type RegisterSduiChildInput = CreateSduiChildInput;
