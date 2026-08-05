import { ForbiddenError } from '@carbroz/common';
export class UpdateSduiDraftUseCase {
    sduiRegistryRepository;
    constructor(sduiRegistryRepository) {
        this.sduiRegistryRepository = sduiRegistryRepository;
    }
    async execute(input) {
        if (!input.context.authenticatedUser?.isAdmin) {
            throw new ForbiddenError('Only administrators can update SDUI drafts');
        }
        return await this.sduiRegistryRepository.updateDraft(input.data);
    }
}
//# sourceMappingURL=UpdateSduiDraftUseCase.js.map