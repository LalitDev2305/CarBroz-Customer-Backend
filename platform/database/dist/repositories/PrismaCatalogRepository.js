import { ServiceCategory, Service, ServiceAddon } from '@carbroz/foundation-kernel';
export class PrismaCatalogRepository {
    prismaProvider;
    constructor(prismaProvider) {
        this.prismaProvider = prismaProvider;
    }
    get prisma() {
        return this.prismaProvider.getClient();
    }
    async findById(id) {
        const model = await this.prisma.serviceCategory.findUnique({ where: { id, deletedAt: null } });
        return model ? new ServiceCategory(model) : null;
    }
    async findAll() {
        const models = await this.prisma.serviceCategory.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } });
        return models.map(m => new ServiceCategory(m));
    }
    async save(entity) {
        if (entity.id) {
            return this.updateCategory(entity.id, entity);
        }
        return this.createCategory(entity);
    }
    async delete(id) {
        try {
            await this.prisma.serviceCategory.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async findAllActiveCategories() {
        const models = await this.prisma.serviceCategory.findMany({
            where: { isActive: true, deletedAt: null },
            orderBy: { sortOrder: 'asc' }
        });
        return models.map(m => new ServiceCategory(m));
    }
    async findCategoryBySlug(slug) {
        const model = await this.prisma.serviceCategory.findUnique({ where: { slug, deletedAt: null } });
        return model ? new ServiceCategory(model) : null;
    }
    async findCategoryByPublicId(publicId) {
        const model = await this.prisma.serviceCategory.findUnique({ where: { publicId, deletedAt: null } });
        return model ? new ServiceCategory(model) : null;
    }
    async findServicesByCategoryId(categoryId) {
        const models = await this.prisma.service.findMany({
            where: { categoryId, isActive: true, deletedAt: null },
            include: { addons: { where: { isActive: true, deletedAt: null } } }
        });
        return models.map(m => new Service({
            ...m,
            addons: m.addons.map(a => new ServiceAddon(a))
        }));
    }
    async findServiceBySlug(slug) {
        const model = await this.prisma.service.findUnique({
            where: { slug, deletedAt: null },
            include: { addons: { where: { isActive: true, deletedAt: null } } }
        });
        return model ? new Service({ ...model, addons: model.addons.map(a => new ServiceAddon(a)) }) : null;
    }
    async findServiceByPublicId(publicId) {
        const model = await this.prisma.service.findUnique({
            where: { publicId, deletedAt: null },
            include: { addons: { where: { isActive: true, deletedAt: null } } }
        });
        return model ? new Service({ ...model, addons: model.addons.map(a => new ServiceAddon(a)) }) : null;
    }
    async findServiceById(id) {
        const model = await this.prisma.service.findUnique({
            where: { id, deletedAt: null },
            include: { addons: { where: { isActive: true, deletedAt: null } } }
        });
        return model ? new Service({ ...model, addons: model.addons.map(a => new ServiceAddon(a)) }) : null;
    }
    async createCategory(category) {
        const created = await this.prisma.serviceCategory.create({
            data: {
                name: category.name,
                slug: category.slug,
                description: category.description,
                iconUrl: category.iconUrl,
                sortOrder: category.sortOrder ?? 0,
                isActive: category.isActive ?? true
            }
        });
        return new ServiceCategory(created);
    }
    async updateCategory(id, category) {
        const updated = await this.prisma.serviceCategory.update({
            where: { id },
            data: {
                name: category.name,
                slug: category.slug,
                description: category.description,
                iconUrl: category.iconUrl,
                sortOrder: category.sortOrder,
                isActive: category.isActive
            }
        });
        return new ServiceCategory(updated);
    }
    async createService(service) {
        const created = await this.prisma.service.create({
            data: {
                categoryId: service.categoryId,
                name: service.name,
                slug: service.slug,
                description: service.description,
                imageUrl: service.imageUrl,
                basePrice: service.basePrice,
                estimatedDurationMinutes: service.estimatedDurationMinutes ?? 60,
                isActive: service.isActive ?? true
            }
        });
        return new Service(created);
    }
    async updateService(id, service) {
        const updated = await this.prisma.service.update({
            where: { id },
            data: {
                name: service.name,
                slug: service.slug,
                description: service.description,
                imageUrl: service.imageUrl,
                basePrice: service.basePrice,
                estimatedDurationMinutes: service.estimatedDurationMinutes,
                isActive: service.isActive
            }
        });
        return new Service(updated);
    }
    async findAddonsByServiceId(serviceId) {
        const models = await this.prisma.serviceAddon.findMany({
            where: { serviceId, isActive: true, deletedAt: null }
        });
        return models.map(m => new ServiceAddon(m));
    }
    async findAddonById(id) {
        const model = await this.prisma.serviceAddon.findUnique({ where: { id, deletedAt: null } });
        return model ? new ServiceAddon(model) : null;
    }
    async findAddonsByIds(ids) {
        const models = await this.prisma.serviceAddon.findMany({
            where: { id: { in: ids }, isActive: true, deletedAt: null }
        });
        return models.map(m => new ServiceAddon(m));
    }
    async createAddon(addon) {
        const created = await this.prisma.serviceAddon.create({
            data: {
                serviceId: addon.serviceId,
                name: addon.name,
                description: addon.description,
                price: addon.price,
                isActive: addon.isActive ?? true
            }
        });
        return new ServiceAddon(created);
    }
}
//# sourceMappingURL=PrismaCatalogRepository.js.map