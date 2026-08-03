export class ManageCatalogUseCase {
    catalogRepository;
    constructor(catalogRepository) {
        this.catalogRepository = catalogRepository;
    }
    async execute(request) {
        const user = request.context.authenticatedUser;
        if (!user?.isAdmin) {
            throw new Error('FORBIDDEN: Admin privileges required');
        }
        const { action, categoryId, serviceId, payload } = request.data;
        switch (action) {
            case 'CREATE_CATEGORY': {
                const category = await this.catalogRepository.createCategory(payload);
                return category;
            }
            case 'UPDATE_CATEGORY': {
                if (!categoryId)
                    throw new Error('BAD_REQUEST: categoryId required');
                const updated = await this.catalogRepository.updateCategory(categoryId, payload);
                return updated;
            }
            case 'CREATE_SERVICE': {
                const service = await this.catalogRepository.createService(payload);
                return service;
            }
            case 'UPDATE_SERVICE': {
                if (!serviceId)
                    throw new Error('BAD_REQUEST: serviceId required');
                const updated = await this.catalogRepository.updateService(serviceId, payload);
                return updated;
            }
            case 'CREATE_ADDON': {
                const addon = await this.catalogRepository.createAddon(payload);
                return addon;
            }
            default:
                throw new Error('BAD_REQUEST: Invalid catalog management action');
        }
    }
}
//# sourceMappingURL=ManageCatalogUseCase.js.map