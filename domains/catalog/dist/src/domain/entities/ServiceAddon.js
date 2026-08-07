export class ServiceAddon {
    id;
    publicId;
    serviceId;
    name;
    description;
    price;
    isActive;
    createdAt;
    updatedAt;
    deletedAt;
    constructor(data) {
        this.id = data.id;
        this.publicId = data.publicId;
        this.serviceId = data.serviceId;
        this.name = data.name;
        this.description = data.description ?? null;
        this.price = data.price ?? 0;
        this.isActive = data.isActive ?? true;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.deletedAt = data.deletedAt;
    }
}
//# sourceMappingURL=ServiceAddon.js.map