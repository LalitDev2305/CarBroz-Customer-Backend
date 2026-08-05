import { ForbiddenError } from '@carbroz/common';
export class ArchiveSduiVersionUseCase {
    sduiRegistryRepository;
    constructor(sduiRegistryRepository) {
        this.sduiRegistryRepository = sduiRegistryRepository;
    }
    async execute(input) {
        if (!input.context.authenticatedUser?.isAdmin) {
            throw new ForbiddenError('Only administrators can archive SDUI versions');
        }
        const { screenId, targetApp = 'CUSTOMER', versionNumber } = input.data;
        return await this.sduiRegistryRepository.archiveVersion(screenId, targetApp, versionNumber);
    }
}
//# sourceMappingURL=ArchiveSduiVersionUseCase.js.map