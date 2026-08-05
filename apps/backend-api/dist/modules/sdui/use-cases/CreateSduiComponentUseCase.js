import { ForbiddenError } from '@carbroz/common';
export class CreateSduiComponentUseCase {
    sduiRegistryRepository;
    constructor(sduiRegistryRepository) {
        this.sduiRegistryRepository = sduiRegistryRepository;
    }
    async execute(input) {
        if (!input.context.authenticatedUser?.isAdmin) {
            throw new ForbiddenError('Only administrators can create SDUI components');
        }
        const { name, componentType, schemaJson, supportedProperties, supportedActions } = input.data;
        return await this.sduiRegistryRepository.createComponent(name, componentType, schemaJson, 'COMPONENT', supportedProperties, supportedActions);
    }
}
export const RegisterSduiComponentUseCase = CreateSduiComponentUseCase;
//# sourceMappingURL=CreateSduiComponentUseCase.js.map