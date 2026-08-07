export class GetCatalogUseCase {
    catalogRepository;
    constructor(catalogRepository) {
        this.catalogRepository = catalogRepository;
    }
    async execute() {
        const categories = await this.catalogRepository.findAllActiveCategories();
        const result = await Promise.all(categories.map(async (category) => {
            const services = await this.catalogRepository.findServicesByCategoryId(category.id);
            return {
                ...category,
                services
            };
        }));
        return result;
    }
}
//# sourceMappingURL=GetCatalogUseCase.js.map