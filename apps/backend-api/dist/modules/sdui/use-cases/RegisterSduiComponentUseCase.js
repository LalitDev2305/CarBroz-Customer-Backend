import { ForbiddenError } from '@carbroz/common';
export class RegisterSduiComponentUseCase {
    sduiRegistryRepository;
    constructor(sduiRegistryRepository) {
        this.sduiRegistryRepository = sduiRegistryRepository;
    }
    async execute(input) {
        if (!input.context.authenticatedUser?.isAdmin) {
            throw new ForbiddenError('Only administrators can register SDUI components');
        }
        const { name, componentType, schemaJson, nodeLevel, supportedProperties, supportedActions } = input.data;
        return await this.sduiRegistryRepository.registerComponent(name, componentType, schemaJson, nodeLevel, supportedProperties, supportedActions);
    }
}
//# sourceMappingURL=RegisterSduiComponentUseCase.js.map