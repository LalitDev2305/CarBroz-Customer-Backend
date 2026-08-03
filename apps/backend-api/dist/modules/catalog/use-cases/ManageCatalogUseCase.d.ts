import { IUseCase, IRequestContext, ICatalogRepository } from '@carbroz/common';
export interface ManageCatalogRequest {
    action: 'CREATE_CATEGORY' | 'UPDATE_CATEGORY' | 'CREATE_SERVICE' | 'UPDATE_SERVICE' | 'CREATE_ADDON';
    categoryId?: number;
    serviceId?: number;
    addonId?: number;
    payload: any;
}
export declare class ManageCatalogUseCase implements IUseCase<{
    context: IRequestContext;
    data: ManageCatalogRequest;
}, any> {
    private readonly catalogRepository;
    constructor(catalogRepository: ICatalogRepository);
    execute(request: {
        context: IRequestContext;
        data: ManageCatalogRequest;
    }): Promise<any>;
}
