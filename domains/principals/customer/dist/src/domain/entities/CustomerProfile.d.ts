export declare class CustomerProfile {
    id?: number;
    publicId?: string;
    userId: number;
    firstName: string | null;
    lastName: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    marketingOptIn: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
    constructor(data: Partial<CustomerProfile>);
}
