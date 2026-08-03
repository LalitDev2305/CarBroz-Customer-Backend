import { NotFoundError } from '@carbroz/common';
import { sduiJsonContractSchema } from '../dtos/sdui-registry.dto.js';
export class GetSduiScreenUseCase {
    sduiRegistryRepository;
    screenFactory;
    constructor(sduiRegistryRepository, screenFactory) {
        this.sduiRegistryRepository = sduiRegistryRepository;
        this.screenFactory = screenFactory;
    }
    async execute(input) {
        const { screenId, targetApp = 'CUSTOMER' } = input.data;
        // 1. Try DB lookup
        const dbScreen = await this.sduiRegistryRepository.findPublishedScreen(screenId, targetApp);
        if (dbScreen) {
            const validated = sduiJsonContractSchema.safeParse(dbScreen.layoutJson);
            if (validated.success) {
                return validated.data;
            }
        }
        // 2. Fallback to ScreenFactory from @carbroz/ui-sdk
        try {
            const staticScreen = await this.screenFactory.buildScreen(screenId, input.context);
            const validatedStatic = sduiJsonContractSchema.parse(staticScreen);
            return validatedStatic;
        }
        catch (err) {
            throw new NotFoundError(`Screen layout for screenId '${screenId}' (targetApp: ${targetApp}) not found.`);
        }
    }
}
//# sourceMappingURL=GetSduiScreenUseCase.js.map