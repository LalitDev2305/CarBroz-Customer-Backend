import { ForbiddenError, type IRequestContext, type IUseCase } from '@carbroz/foundation-kernel';
import { type ISduiRegistryRepository } from '../domain/repositories/ISduiRegistryRepository.js';
import { SduiSectionEntity } from '../domain/SduiSection.js';
import { type CreateSduiSectionDto } from '../dtos/sdui-registry.dto.js';

export interface CreateSduiSectionInput {
  context: IRequestContext;
  data: CreateSduiSectionDto;
}

export class CreateSduiSectionUseCase implements IUseCase<CreateSduiSectionInput, SduiSectionEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: CreateSduiSectionInput): Promise<SduiSectionEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can create SDUI sections');
    }

    return this.sduiRegistryRepository.createSection(input.data);
  }
}
