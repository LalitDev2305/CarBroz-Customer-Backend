export declare class Address {
    id?: number;
    publicId?: string;
    userId: number;
    label: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    isDefault: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
    constructor(data: Partial<Address>);
}
//# sourceMappingURL=Address.d.ts.map