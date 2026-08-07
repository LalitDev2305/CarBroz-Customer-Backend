import { ISduiRegistryRepository, IUseCase, IRequestContext, ForbiddenError, SduiSubcomponentEntity } from '@carbroz/common';
import { CreateSduiSubcomponentDto } from '../dtos/sdui-registry.dto.js';

export interface CreateSduiSubcomponentInput {
  context: IRequestContext;
  data: CreateSduiSubcomponentDto;
}

export class CreateSduiSubcomponentUseCase implements IUseCase<CreateSduiSubcomponentInput, SduiSubcomponentEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: CreateSduiSubcomponentInput): Promise<SduiSubcomponentEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can create SDUI subcomponents');
    }

    const { name, componentType, schemaJson, supportedProperties, supportedActions } = input.data;
    return await this.sduiRegistryRepository.createSubcomponent(
      name,
      componentType,
      schemaJson,
      supportedProperties,
      supportedActions
    );
  }
}

export const RegisterSduiSubcomponentUseCase = CreateSduiSubcomponentUseCase;
export type RegisterSduiSubcomponentInput = CreateSduiSubcomponentInput;
