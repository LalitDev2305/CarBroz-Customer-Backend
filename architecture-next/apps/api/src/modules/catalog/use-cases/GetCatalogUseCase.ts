import { IUseCase, IRequestContext, ICatalogRepository, ServiceCategory, Service } from '@carbroz/common';

export interface CategoryWithServices extends ServiceCategory {
  services?: Service[];
}

export class GetCatalogUseCase implements IUseCase<{ context?: IRequestContext; data?: Record<string, never> }, CategoryWithServices[]> {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(): Promise<CategoryWithServices[]> {
    const categories = await this.catalogRepository.findAllActiveCategories();
    
    const result: CategoryWithServices[] = await Promise.all(
      categories.map(async (category) => {
        const services = await this.catalogRepository.findServicesByCategoryId(category.id!);
        return {
          ...category,
          services
        };
      })
    );

    return result;
  }
}
