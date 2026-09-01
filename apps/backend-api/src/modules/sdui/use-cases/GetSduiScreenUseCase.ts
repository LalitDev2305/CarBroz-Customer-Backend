import { IUseCase, IRequestContext, NotFoundError } from '@carbroz/common';
import type { ISduiRegistryRepository } from '@carbroz/domain-sdui-registry';
import { parseSduiScreen, type SduiScreen } from '@carbroz/sdui-engine';
import type { GetSduiScreenDto } from '../dtos/sdui-registry.dto.js';

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
