export class Address {
    id;
    publicId;
    userId;
    label;
    addressLine1;
    addressLine2;
    city;
    state;
    postalCode;
    country;
    latitude;
    longitude;
    isDefault;
    createdAt;
    updatedAt;
    deletedAt;
    constructor(data) {
        this.id = data.id;
        this.publicId = data.publicId;
        this.userId = data.userId;
        this.label = data.label ?? null;
        this.addressLine1 = data.addressLine1;
        this.addressLine2 = data.addressLine2 ?? null;
        this.city = data.city;
        this.state = data.state;
        this.postalCode = data.postalCode;
        this.country = data.country;
        this.latitude = data.latitude ?? null;
        this.longitude = data.longitude ?? null;
        this.isDefault = data.isDefault ?? false;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.deletedAt = data.deletedAt;
    }
}
//# sourceMappingURL=Address.js.map