import { ForbiddenError } from '@carbroz/foundation-kernel';
export class CreateSduiChildUseCase {
    sduiRegistryRepository;
    constructor(sduiRegistryRepository) {
        this.sduiRegistryRepository = sduiRegistryRepository;
    }
    async execute(input) {
        if (!input.context.authenticatedUser?.isAdmin) {
            throw new ForbiddenError('Only administrators can create SDUI children');
        }
        const { name, componentType, schemaJson, supportedProperties, supportedActions } = input.data;
        return await this.sduiRegistryRepository.createChild(name, componentType, schemaJson, supportedProperties, supportedActions);
    }
}
export const RegisterSduiChildUseCase = CreateSduiChildUseCase;
//# sourceMappingURL=CreateSduiChildUseCase.js.map