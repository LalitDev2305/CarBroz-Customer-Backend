export class PricingTier {
    id;
    publicId;
    serviceId;
    name;
    flatPrice;
    isDefault;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id;
        this.publicId = data.publicId;
        this.serviceId = data.serviceId;
        this.name = data.name;
        this.flatPrice = data.flatPrice ?? 0;
        this.isDefault = data.isDefault ?? false;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}
export class VehicleTypeMultiplierEntity {
    id;
    publicId;
    serviceId;
    vehicleType;
    multiplier;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id;
        this.publicId = data.publicId;
        this.serviceId = data.serviceId;
        this.vehicleType = data.vehicleType;
        this.multiplier = data.multiplier ?? 1.0;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}
//# sourceMappingURL=PricingTier.js.map