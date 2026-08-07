import { VehicleStatus } from './VehicleStatus.js';
export interface VehicleProps {
    id?: number;
    publicId?: string;
    customerId: number;
    make: string;
    model: string;
    variant?: string | null;
    year: number;
    registrationNumber: string;
    fuelType: string;
    color?: string | null;
    nickname?: string | null;
    isDefault?: boolean;
    status?: VehicleStatus;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export declare class Vehicle {
    id?: number;
    publicId?: string;
    customerId: number;
    make: string;
    model: string;
    variant: string | null;
    year: number;
    registrationNumber: string;
    fuelType: string;
    color: string | null;
    nickname: string | null;
    isDefault: boolean;
    status: VehicleStatus;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt: Date | null;
    constructor(props: VehicleProps);
    isBookable(): boolean;
    archive(): void;
    setDefault(isDefault: boolean): void;
}
//# sourceMappingURL=Vehicle.d.ts.map