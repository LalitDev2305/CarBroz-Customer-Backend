import { ISduiRegistryRepository, IUseCase, IRequestContext, ForbiddenError, SduiChildrenDataEntity } from '@carbroz/common';
import { CreateSduiChildrenDataDto } from '../dtos/sdui-registry.dto.js';

export interface CreateSduiChildrenDataInput {
  context: IRequestContext;
  data: CreateSduiChildrenDataDto;
}

export class CreateSduiChildrenDataUseCase implements IUseCase<CreateSduiChildrenDataInput, SduiChildrenDataEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: CreateSduiChildrenDataInput): Promise<SduiChildrenDataEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can create SDUI childrenData');
    }

    const { name, componentType, schemaJson, supportedProperties, supportedActions } = input.data;
    return await this.sduiRegistryRepository.createChildrenData(
      name,
      componentType,
      schemaJson,
      supportedProperties,
      supportedActions
    );
  }
}

export const RegisterSduiChildrenDataUseCase = CreateSduiChildrenDataUseCase;
export type RegisterSduiChildrenDataInput = CreateSduiChildrenDataInput;
