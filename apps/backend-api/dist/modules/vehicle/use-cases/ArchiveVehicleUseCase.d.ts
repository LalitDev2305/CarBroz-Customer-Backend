import { IVehicleRepository } from '@carbroz/common';
export declare class ArchiveVehicleUseCase {
    private readonly vehicleRepository;
    constructor(vehicleRepository: IVehicleRepository);
    execute(publicId: string, customerId: number): Promise<void>;
}
