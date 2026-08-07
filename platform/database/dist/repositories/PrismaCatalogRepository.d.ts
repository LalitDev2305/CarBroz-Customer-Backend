import { ICatalogRepository, ServiceCategory, Service, ServiceAddon } from '@carbroz/foundation-kernel';
import { PrismaProvider } from '../providers/PrismaProvider.js';
export declare class PrismaCatalogRepository implements ICatalogRepository {
    private readonly prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    findById(id: number): Promise<ServiceCategory | null>;
    findAll(): Promise<ServiceCategory[]>;
    save(entity: ServiceCategory): Promise<ServiceCategory>;
    delete(id: number): Promise<boolean>;
    findAllActiveCategories(): Promise<ServiceCategory[]>;
    findCategoryBySlug(slug: string): Promise<ServiceCategory | null>;
    findCategoryByPublicId(publicId: string): Promise<ServiceCategory | null>;
    findServicesByCategoryId(categoryId: number): Promise<Service[]>;
    findServiceBySlug(slug: string): Promise<Service | null>;
    findServiceByPublicId(publicId: string): Promise<Service | null>;
    findServiceById(id: number): Promise<Service | null>;
    createCategory(category: Partial<ServiceCategory>): Promise<ServiceCategory>;
    updateCategory(id: number, category: Partial<ServiceCategory>): Promise<ServiceCategory>;
    createService(service: Partial<Service>): Promise<Service>;
    updateService(id: number, service: Partial<Service>): Promise<Service>;
    findAddonsByServiceId(serviceId: number): Promise<ServiceAddon[]>;
    findAddonById(id: number): Promise<ServiceAddon | null>;
    findAddonsByIds(ids: number[]): Promise<ServiceAddon[]>;
    createAddon(addon: Partial<ServiceAddon>): Promise<ServiceAddon>;
}
//# sourceMappingURL=PrismaCatalogRepository.d.ts.map