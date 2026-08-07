export declare class PricingTier {
    id?: number;
    publicId?: string;
    serviceId: number;
    name: string;
    flatPrice: number;
    isDefault: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    constructor(data: Partial<PricingTier>);
}
export declare class VehicleTypeMultiplierEntity {
    id?: number;
    publicId?: string;
    serviceId: number;
    vehicleType: string;
    multiplier: number;
    createdAt?: Date;
    updatedAt?: Date;
    constructor(data: Partial<VehicleTypeMultiplierEntity>);
}
