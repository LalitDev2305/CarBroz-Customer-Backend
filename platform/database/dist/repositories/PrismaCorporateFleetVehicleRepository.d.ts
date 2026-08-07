import { PrismaClient } from '@prisma/client';
import { ICorporateFleetVehicleRepository, CorporateFleetVehicle } from '@carbroz/foundation-kernel';
export declare class PrismaCorporateFleetVehicleRepository implements ICorporateFleetVehicleRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private mapToDomain;
    create(fleetVehicle: CorporateFleetVehicle): Promise<CorporateFleetVehicle>;
    update(fleetVehicle: CorporateFleetVehicle): Promise<CorporateFleetVehicle>;
    findById(id: number): Promise<CorporateFleetVehicle | null>;
    findByPublicId(publicId: string): Promise<CorporateFleetVehicle | null>;
    findByAccountAndVehicle(corporateAccountId: number, vehicleId: number): Promise<CorporateFleetVehicle | null>;
    findByVehicleId(vehicleId: number): Promise<CorporateFleetVehicle | null>;
    listByAccountId(corporateAccountId: number): Promise<CorporateFleetVehicle[]>;
    delete(id: number): Promise<void>;
}
//# sourceMappingURL=PrismaCorporateFleetVehicleRepository.d.ts.map