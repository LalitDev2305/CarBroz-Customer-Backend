import { ISduiRegistryRepository, IUseCase, IRequestContext, ForbiddenError, SduiComponentRegistryEntity } from '@carbroz/common';
import { RegisterSduiComponentDto } from '../dtos/sdui-registry.dto.js';

export interface RegisterSduiComponentInput {
  context: IRequestContext;
  data: RegisterSduiComponentDto;
}

export class RegisterSduiComponentUseCase implements IUseCase<RegisterSduiComponentInput, SduiComponentRegistryEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: RegisterSduiComponentInput): Promise<SduiComponentRegistryEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can register SDUI components');
    }

    const { name, componentType, schemaJson, nodeLevel, supportedProperties, supportedActions } = input.data;
    return await this.sduiRegistryRepository.registerComponent(
      name,
      componentType,
      schemaJson,
      nodeLevel,
      supportedProperties,
      supportedActions
    );
  }
}
