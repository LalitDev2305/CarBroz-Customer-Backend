import { IVehicleRepository, Vehicle } from '@carbroz/foundation-kernel';
export interface CreateVehicleInput {
    customerId: number;
    make: string;
    model: string;
    variant?: string;
    year: number;
    registrationNumber: string;
    fuelType: string;
    color?: string;
    nickname?: string;
    isDefault?: boolean;
}
export declare class CreateVehicleUseCase {
    private readonly vehicleRepository;
    constructor(vehicleRepository: IVehicleRepository);
    execute(input: CreateVehicleInput): Promise<Vehicle>;
}
