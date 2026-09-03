import { IUseCase, IRequestContext, ForbiddenError } from '@carbroz/common';
import type { ISduiRegistryRepository, SduiScreenEntity } from '@carbroz/sdui-registry';
import { UpdateSduiDraftDto } from '../dtos/sdui-registry.dto.js';

export interface UpdateSduiDraftInput {
  context: IRequestContext;
  data: UpdateSduiDraftDto;
}

export class UpdateSduiDraftUseCase implements IUseCase<UpdateSduiDraftInput, SduiScreenEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: UpdateSduiDraftInput): Promise<SduiScreenEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can update SDUI drafts');
    }

    return await this.sduiRegistryRepository.updateDraft(input.data);
  }
}
