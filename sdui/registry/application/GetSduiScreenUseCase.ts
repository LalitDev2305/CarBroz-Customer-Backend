import { type IUseCase, type IRequestContext, NotFoundError } from '@carbroz/foundation-kernel';
import { type ISduiRegistryRepository } from '../domain/repositories/ISduiRegistryRepository.js';
import { parseSduiScreen, type SduiScreen } from '@carbroz/ui-sdk';
import { type GetSduiScreenDto } from '../dtos/sdui-registry.dto.js';

export interface GetSduiScreenInput {
  context?: IRequestContext;
  data: GetSduiScreenDto;
}

export class GetSduiScreenUseCase implements IUseCase<GetSduiScreenInput, SduiScreen> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: GetSduiScreenInput): Promise<SduiScreen> {
    const { screenId, targetApp } = input.data;
    const screen = await this.sduiRegistryRepository.findPublishedScreen(screenId, targetApp);

    if (!screen) {
      throw new NotFoundError(`Published screen '${screenId}' for target '${targetApp}' was not found.`);
    }

    // Persistence is never trusted blindly. Published documents must satisfy
    // the exact canonical V3 contract before they leave the backend.
    return parseSduiScreen(screen.layoutJson);
  }
}
