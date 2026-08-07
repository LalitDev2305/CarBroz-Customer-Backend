import { ForbiddenError } from '@carbroz/foundation-kernel';
export class CreateSduiDraftUseCase {
    sduiRegistryRepository;
    constructor(sduiRegistryRepository) {
        this.sduiRegistryRepository = sduiRegistryRepository;
    }
    async execute(input) {
        if (!input.context.authenticatedUser?.isAdmin) {
            throw new ForbiddenError('Only administrators can create SDUI drafts');
        }
        return await this.sduiRegistryRepository.createDraft(input.data);
    }
}
//# sourceMappingURL=CreateSduiDraftUseCase.js.map