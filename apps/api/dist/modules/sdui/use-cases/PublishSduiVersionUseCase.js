import { ForbiddenError } from '@carbroz/foundation-kernel';
export class PublishSduiVersionUseCase {
    sduiRegistryRepository;
    constructor(sduiRegistryRepository) {
        this.sduiRegistryRepository = sduiRegistryRepository;
    }
    async execute(input) {
        if (!input.context.authenticatedUser?.isAdmin) {
            throw new ForbiddenError('Only administrators can publish SDUI versions');
        }
        const { screenId, targetApp = 'CUSTOMER', versionNumber } = input.data;
        const publisherName = `user-${input.context.authenticatedUser.id}`;
        return await this.sduiRegistryRepository.publishVersion(screenId, targetApp, versionNumber, publisherName);
    }
}
//# sourceMappingURL=PublishSduiVersionUseCase.js.map