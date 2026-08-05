import { ISduiRegistryRepository, IUseCase, IRequestContext, ForbiddenError, SduiComponentEntity } from '@carbroz/common';
import { CreateSduiComponentDto } from '../dtos/sdui-registry.dto.js';

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

    const { name, componentType, schemaJson, supportedProperties, supportedActions } = input.data;
    return await this.sduiRegistryRepository.createComponent(
      name,
      componentType,
      schemaJson,
      'COMPONENT',
      supportedProperties,
      supportedActions
    );
  }
}

export const RegisterSduiComponentUseCase = CreateSduiComponentUseCase;
export type RegisterSduiComponentInput = CreateSduiComponentInput;
