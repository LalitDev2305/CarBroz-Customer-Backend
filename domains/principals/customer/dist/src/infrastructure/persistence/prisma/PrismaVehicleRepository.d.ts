import { PrismaProvider } from '@carbroz/platform-database';
import { Vehicle } from '../../../domain/entities/Vehicle.js';
export declare class PrismaVehicleRepository {
    private readonly prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    private mapToDomain;
    create(vehicle: Vehicle): Promise<Vehicle>;
    findById(id: number): Promise<Vehicle | null>;
    findByPublicId(publicId: string): Promise<Vehicle | null>;
    findByCustomerAndRegistration(customerId: number, registrationNumber: string): Promise<Vehicle | null>;
    listByCustomerId(customerId: number): Promise<Vehicle[]>;
    update(vehicle: Vehicle): Promise<Vehicle>;
    unsetCustomerDefaultVehicles(customerId: number, excludeVehicleId?: number): Promise<void>;
    softDelete(id: number): Promise<void>;
}
