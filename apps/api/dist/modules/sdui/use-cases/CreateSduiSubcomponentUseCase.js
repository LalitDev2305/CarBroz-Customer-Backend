import { ForbiddenError } from '@carbroz/foundation-kernel';
export class CreateSduiSubcomponentUseCase {
    sduiRegistryRepository;
    constructor(sduiRegistryRepository) {
        this.sduiRegistryRepository = sduiRegistryRepository;
    }
    async execute(input) {
        if (!input.context.authenticatedUser?.isAdmin) {
            throw new ForbiddenError('Only administrators can create SDUI subcomponents');
        }
        const { name, componentType, schemaJson, supportedProperties, supportedActions } = input.data;
        return await this.sduiRegistryRepository.createSubcomponent(name, componentType, schemaJson, supportedProperties, supportedActions);
    }
}
export const RegisterSduiSubcomponentUseCase = CreateSduiSubcomponentUseCase;
//# sourceMappingURL=CreateSduiSubcomponentUseCase.js.map