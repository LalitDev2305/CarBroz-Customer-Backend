import { IUseCase, IRequestContext, ICatalogRepository, ServiceCategory, Service } from '@carbroz/common';
export interface CategoryWithServices extends ServiceCategory {
    services?: Service[];
}
export declare class GetCatalogUseCase implements IUseCase<{
    context?: IRequestContext;
    data?: Record<string, never>;
}, CategoryWithServices[]> {
    private readonly catalogRepository;
    constructor(catalogRepository: ICatalogRepository);
    execute(): Promise<CategoryWithServices[]>;
}
