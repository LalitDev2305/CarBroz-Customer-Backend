import { type IUseCase, type IRequestContext } from '@carbroz/foundation-kernel';
import { type ICatalogRepository } from '../catalog/domain/repositories/ICatalogRepository.js';
import { ServiceCategory } from '../catalog/domain/ServiceCategory.js';
import { Service } from '../catalog/domain/Service.js';
import { ServiceAddon } from '../catalog/domain/ServiceAddon.js';

export interface ManageCatalogRequest {
  action: 'CREATE_CATEGORY' | 'UPDATE_CATEGORY' | 'CREATE_SERVICE' | 'UPDATE_SERVICE' | 'CREATE_ADDON';
  categoryId?: number;
  serviceId?: number;
  addonId?: number;
  payload: any;
}

export class ManageCatalogUseCase implements IUseCase<{ context: IRequestContext; data: ManageCatalogRequest }, any> {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(request: { context: IRequestContext; data: ManageCatalogRequest }): Promise<any> {
    const user = request.context.authenticatedUser as any;
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
        if (!categoryId) throw new Error('BAD_REQUEST: categoryId required');
        const updated = await this.catalogRepository.updateCategory(categoryId, payload);
        return updated;
      }
      case 'CREATE_SERVICE': {
        const service = await this.catalogRepository.createService(payload);
        return service;
      }
      case 'UPDATE_SERVICE': {
        if (!serviceId) throw new Error('BAD_REQUEST: serviceId required');
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
