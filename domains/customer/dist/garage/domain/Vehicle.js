export class Vehicle {
    id;
    publicId;
    customerId;
    make;
    model;
    variant;
    year;
    registrationNumber;
    fuelType;
    color;
    nickname;
    isDefault;
    status;
    createdAt;
    updatedAt;
    deletedAt;
    constructor(props) {
        if (!props.customerId)
            throw new Error('Vehicle must belong to a customer');
        if (!props.make || !props.model)
            throw new Error('Vehicle make and model are required');
        if (!props.registrationNumber)
            throw new Error('Vehicle registration number is required');
        this.id = props.id;
        this.publicId = props.publicId;
        this.customerId = props.customerId;
        this.make = props.make;
        this.model = props.model;
        this.variant = props.variant ?? null;
        this.year = props.year;
        this.registrationNumber = props.registrationNumber.trim().toUpperCase();
        this.fuelType = props.fuelType;
        this.color = props.color ?? null;
        this.nickname = props.nickname ?? null;
        this.isDefault = props.isDefault ?? false;
        this.status = props.status ?? 'ACTIVE';
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.deletedAt = props.deletedAt ?? null;
    }
    isBookable() {
        return this.status === 'ACTIVE' && this.deletedAt === null;
    }
    archive() {
        this.status = 'ARCHIVED';
        this.deletedAt = new Date();
    }
    setDefault(isDefault) {
        this.isDefault = isDefault;
    }
}
//# sourceMappingURL=Vehicle.js.map