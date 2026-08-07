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
//# sourceMappingURL=VehicleTypeMultiplierEntity.js.map