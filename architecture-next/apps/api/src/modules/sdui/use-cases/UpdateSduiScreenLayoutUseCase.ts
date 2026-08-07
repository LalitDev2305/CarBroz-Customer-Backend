import { ISduiRegistryRepository, IUseCase, IRequestContext, ForbiddenError, SduiScreenEntity } from '@carbroz/common';
import { UpdateSduiScreenDto, sduiJsonContractSchema } from '../dtos/sdui-registry.dto.js';

export interface UpdateSduiScreenLayoutInput {
  context: IRequestContext;
  data: UpdateSduiScreenDto;
}

export class UpdateSduiScreenLayoutUseCase implements IUseCase<UpdateSduiScreenLayoutInput, SduiScreenEntity> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: UpdateSduiScreenLayoutInput): Promise<SduiScreenEntity> {
    if (!input.context.authenticatedUser?.isAdmin) {
      throw new ForbiddenError('Only administrators can update SDUI screen layouts');
    }

    const { screenId, targetApp = 'CUSTOMER', layoutJson, isPublished = true } = input.data;

    // Validate layout payload strictly against locked contract schema before persisting
    sduiJsonContractSchema.parse(layoutJson);

    return await this.sduiRegistryRepository.upsertScreen(screenId, targetApp, layoutJson, isPublished);
  }
}
