import { NotFoundError } from '@carbroz/common';
export class GetSduiSpecificVersionUseCase {
    sduiRegistryRepository;
    constructor(sduiRegistryRepository) {
        this.sduiRegistryRepository = sduiRegistryRepository;
    }
    async execute(input) {
        const { screenId, targetApp = 'CUSTOMER', versionNumber } = input;
        const version = await this.sduiRegistryRepository.getSpecificVersion(screenId, targetApp, versionNumber);
        if (!version) {
            throw new NotFoundError(`Screen version ${versionNumber} not found for screen '${screenId}'`);
        }
        return version;
    }
}
//# sourceMappingURL=GetSduiSpecificVersionUseCase.js.map