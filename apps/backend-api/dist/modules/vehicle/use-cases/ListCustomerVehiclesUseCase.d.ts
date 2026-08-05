import { IVehicleRepository, Vehicle } from '@carbroz/common';
export declare class ListCustomerVehiclesUseCase {
    private readonly vehicleRepository;
    constructor(vehicleRepository: IVehicleRepository);
    execute(customerId: number): Promise<Vehicle[]>;
}
