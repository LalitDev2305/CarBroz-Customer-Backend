export class ServiceCategory {
    id;
    publicId;
    name;
    slug;
    description;
    iconUrl;
    sortOrder;
    isActive;
    createdAt;
    updatedAt;
    deletedAt;
    constructor(data) {
        this.id = data.id;
        this.publicId = data.publicId;
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description ?? null;
        this.iconUrl = data.iconUrl ?? null;
        this.sortOrder = data.sortOrder ?? 0;
        this.isActive = data.isActive ?? true;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.deletedAt = data.deletedAt;
    }
}
//# sourceMappingURL=ServiceCategory.js.map