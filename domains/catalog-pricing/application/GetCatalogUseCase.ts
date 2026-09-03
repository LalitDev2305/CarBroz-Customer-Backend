import { type IUseCase, type IRequestContext } from '@carbroz/foundation-kernel';
import { type ICatalogRepository } from '../catalog/domain/repositories/ICatalogRepository.js';
import { ServiceCategory } from '../catalog/domain/ServiceCategory.js';
import { Service } from '../catalog/domain/Service.js';

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
