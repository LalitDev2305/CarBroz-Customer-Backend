import { IVehicleRepository, Vehicle } from '@carbroz/common';
export declare class SetDefaultVehicleUseCase {
    private readonly vehicleRepository;
    constructor(vehicleRepository: IVehicleRepository);
    execute(publicId: string, customerId: number): Promise<Vehicle>;
}
