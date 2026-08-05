export interface CorporateFleetVehicleProps {
    id?: number;
    publicId?: string;
    corporateAccountId: number;
    vehicleId: number;
    department?: string | null;
    costCenter?: string | null;
    monthlyCapPaise?: bigint | number | null;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class CorporateFleetVehicle {
    id?: number;
    publicId?: string;
    corporateAccountId: number;
    vehicleId: number;
    department: string | null;
    costCenter: string | null;
    monthlyCapPaise: bigint | null;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
    constructor(props: CorporateFleetVehicleProps);
    deactivate(): void;
    activate(): void;
}
