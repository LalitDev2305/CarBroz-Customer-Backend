import { ISduiRegistryRepository, IUseCase, IRequestContext, NotFoundError } from '@carbroz/common';
import { ScreenFactory } from '@carbroz/ui-sdk';
import { GetSduiScreenDto, sduiJsonContractSchema, SduiJsonContract } from '../dtos/sdui-registry.dto.js';

export interface GetSduiScreenInput {
  context?: IRequestContext;
  data: GetSduiScreenDto;
}

export class GetSduiScreenUseCase implements IUseCase<GetSduiScreenInput, SduiJsonContract> {
  constructor(
    private readonly sduiRegistryRepository: ISduiRegistryRepository,
    private readonly screenFactory: ScreenFactory
  ) {}

  public async execute(input: GetSduiScreenInput): Promise<SduiJsonContract> {
    const { screenId, targetApp = 'CUSTOMER' } = input.data;

    // 1. Try DB lookup
    const dbScreen = await this.sduiRegistryRepository.findPublishedScreen(screenId, targetApp);
    if (dbScreen) {
      const validated = sduiJsonContractSchema.safeParse(dbScreen.layoutJson);
      if (validated.success) {
        return validated.data as SduiJsonContract;
      }
    }

    // 2. Fallback to ScreenFactory from @carbroz/ui-sdk
    try {
      const staticScreen = await this.screenFactory.buildScreen(screenId, input.context);
      const validatedStatic = sduiJsonContractSchema.parse(staticScreen);
      return validatedStatic as SduiJsonContract;
    } catch (err: any) {
      throw new NotFoundError(`Screen layout for screenId '${screenId}' (targetApp: ${targetApp}) not found.`);
    }
  }
}
