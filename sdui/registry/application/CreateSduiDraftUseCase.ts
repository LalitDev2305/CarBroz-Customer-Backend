import { type ISduiRegistryRepository } from '../domain/repositories/ISduiRegistryRepository.js';
import { SduiScreenEntity } from '../domain/SduiScreen.js';
import { type IUseCase, type IRequestContext, ForbiddenError } from '@carbroz/foundation-kernel';
import { type CreateSduiDraftDto } from '../dtos/sdui-registry.dto.js';

export interface CreateSduiDraftInput {
  context: IRequestContext;
  data: CreateSduiDraftDto;
}

export class CreateSduiDraftUseCase implements IUseCase<CreateSduiDraftInput, SduiScreenEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: CreateSduiDraftInput): Promise<SduiScreenEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can create SDUI drafts');
    }

    return await this.sduiRegistryRepository.createDraft(input.data);
  }
}
