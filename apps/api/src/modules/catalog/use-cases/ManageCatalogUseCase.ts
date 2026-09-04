import { IUseCase, ICatalogRepository } from '@carbroz/common';
import type { ExecutionContext } from '@carbroz/foundation-kernel';

export interface ManageCatalogRequest {
  action: 'CREATE_CATEGORY' | 'UPDATE_CATEGORY' | 'CREATE_SERVICE' | 'UPDATE_SERVICE' | 'CREATE_ADDON';
  categoryId?: number;
  serviceId?: number;
  addonId?: number;
  payload: unknown;
}

/** Admin-only catalog mutation orchestration using transport-neutral actor identity. */
export class ManageCatalogUseCase implements IUseCase<{ context: ExecutionContext; data: ManageCatalogRequest }, unknown> {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(request: { context: ExecutionContext; data: ManageCatalogRequest }): Promise<unknown> {
    const actor = request.context.actor;
    if (actor?.kind !== 'ADMIN' && !actor?.roles.includes('ADMIN')) {
      throw new Error('FORBIDDEN: Admin privileges required');
    }

    const { action, categoryId, serviceId, payload } = request.data;

    switch (action) {
      case 'CREATE_CATEGORY':
        return this.catalogRepository.createCategory(payload as any);
      case 'UPDATE_CATEGORY':
        if (!categoryId) throw new Error('BAD_REQUEST: categoryId required');
        return this.catalogRepository.updateCategory(categoryId, payload as any);
      case 'CREATE_SERVICE':
        return this.catalogRepository.createService(payload as any);
      case 'UPDATE_SERVICE':
        if (!serviceId) throw new Error('BAD_REQUEST: serviceId required');
        return this.catalogRepository.updateService(serviceId, payload as any);
      case 'CREATE_ADDON':
        return this.catalogRepository.createAddon(payload as any);
      default:
        throw new Error('BAD_REQUEST: Invalid catalog management action');
    }
  }
}
