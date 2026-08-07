import { IVehicleRepository, Vehicle } from '@carbroz/foundation-kernel';
export declare class ListCustomerVehiclesUseCase {
    private readonly vehicleRepository;
    constructor(vehicleRepository: IVehicleRepository);
    execute(customerId: number): Promise<Vehicle[]>;
}
