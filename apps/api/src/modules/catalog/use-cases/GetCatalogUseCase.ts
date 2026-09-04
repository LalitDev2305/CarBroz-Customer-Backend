import { IUseCase, ICatalogRepository, ServiceCategory, Service } from '@carbroz/common';

export interface CategoryWithServices extends ServiceCategory {
  services?: Service[];
}

/** Returns the active catalog with its active services; no transport context is required. */
export class GetCatalogUseCase implements IUseCase<void, CategoryWithServices[]> {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(): Promise<CategoryWithServices[]> {
    const categories = await this.catalogRepository.findAllActiveCategories();

    return Promise.all(
      categories.map(async (category) => ({
        ...category,
        services: await this.catalogRepository.findServicesByCategoryId(category.id!),
      }))
    );
  }
}
