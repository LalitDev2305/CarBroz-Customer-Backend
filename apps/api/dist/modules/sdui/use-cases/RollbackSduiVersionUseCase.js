import { ForbiddenError } from '@carbroz/foundation-kernel';
export class RollbackSduiVersionUseCase {
    sduiRegistryRepository;
    constructor(sduiRegistryRepository) {
        this.sduiRegistryRepository = sduiRegistryRepository;
    }
    async execute(input) {
        if (!input.context.authenticatedUser?.isAdmin) {
            throw new ForbiddenError('Only administrators can rollback SDUI versions');
        }
        const { screenId, targetApp = 'CUSTOMER', targetVersionNumber } = input.data;
        const publisherName = `user-${input.context.authenticatedUser.id}`;
        return await this.sduiRegistryRepository.rollbackVersion(screenId, targetApp, targetVersionNumber, publisherName);
    }
}
//# sourceMappingURL=RollbackSduiVersionUseCase.js.map