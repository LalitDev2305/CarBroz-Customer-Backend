import { ForbiddenError } from '@carbroz/common';
import { sduiJsonContractSchema } from '../dtos/sdui-registry.dto.js';
export class UpdateSduiScreenLayoutUseCase {
    sduiRegistryRepository;
    constructor(sduiRegistryRepository) {
        this.sduiRegistryRepository = sduiRegistryRepository;
    }
    async execute(input) {
        if (!input.context.authenticatedUser?.isAdmin) {
            throw new ForbiddenError('Only administrators can update SDUI screen layouts');
        }
        const { screenId, targetApp = 'CUSTOMER', layoutJson, isPublished = true } = input.data;
        // Validate layout payload strictly against locked contract schema before persisting
        sduiJsonContractSchema.parse(layoutJson);
        return await this.sduiRegistryRepository.upsertScreen(screenId, targetApp, layoutJson, isPublished);
    }
}
//# sourceMappingURL=UpdateSduiScreenLayoutUseCase.js.map