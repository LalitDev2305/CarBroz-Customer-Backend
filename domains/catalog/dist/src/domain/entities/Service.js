export class Service {
    id;
    publicId;
    categoryId;
    name;
    slug;
    description;
    imageUrl;
    basePrice;
    estimatedDurationMinutes;
    isActive;
    createdAt;
    updatedAt;
    deletedAt;
    addons;
    constructor(data) {
        this.id = data.id;
        this.publicId = data.publicId;
        this.categoryId = data.categoryId;
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description ?? null;
        this.imageUrl = data.imageUrl ?? null;
        this.basePrice = data.basePrice ?? 0;
        this.estimatedDurationMinutes = data.estimatedDurationMinutes ?? 60;
        this.isActive = data.isActive ?? true;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.deletedAt = data.deletedAt;
        this.addons = data.addons;
    }
}
//# sourceMappingURL=Service.js.map