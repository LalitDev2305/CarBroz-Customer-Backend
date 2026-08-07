import { IVehicleRepository } from '@carbroz/foundation-kernel';
export declare class ArchiveVehicleUseCase {
    private readonly vehicleRepository;
    constructor(vehicleRepository: IVehicleRepository);
    execute(publicId: string, customerId: number): Promise<void>;
}
