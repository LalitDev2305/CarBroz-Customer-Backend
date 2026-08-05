import { ForbiddenError } from '@carbroz/common';
export class CreateSduiChildrenDataUseCase {
    sduiRegistryRepository;
    constructor(sduiRegistryRepository) {
        this.sduiRegistryRepository = sduiRegistryRepository;
    }
    async execute(input) {
        if (!input.context.authenticatedUser?.isAdmin) {
            throw new ForbiddenError('Only administrators can create SDUI childrenData');
        }
        const { name, componentType, schemaJson, supportedProperties, supportedActions } = input.data;
        return await this.sduiRegistryRepository.createChildrenData(name, componentType, schemaJson, supportedProperties, supportedActions);
    }
}
export const RegisterSduiChildrenDataUseCase = CreateSduiChildrenDataUseCase;
//# sourceMappingURL=CreateSduiChildrenDataUseCase.js.map