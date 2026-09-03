import { Vehicle } from '../../domain/Vehicle.js';
import { type VehicleStatus } from '../../domain/VehicleStatus.js';
import { type IVehicleRepository } from '../../domain/repositories/IVehicleRepository.js';
import { type VehiclePersistenceClient, type VehiclePersistenceRecord } from '../persistence/VehiclePersistenceClient.js';

export class PrismaVehicleRepository implements IVehicleRepository {
  constructor(private readonly prisma: VehiclePersistenceClient) {}

  private mapToDomain(record: VehiclePersistenceRecord): Vehicle {
    return new Vehicle({
      id: record.id,
      publicId: record.publicId,
      customerId: record.customerId,
      make: record.make,
      model: record.model,
      variant: record.variant,
      year: record.year,
      registrationNumber: record.registrationNumber,
      fuelType: record.fuelType,
      color: record.color,
      nickname: record.nickname,
      isDefault: record.isDefault,
      status: record.status as VehicleStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    });
  }

  async create(vehicle: Vehicle): Promise<Vehicle> {
    const record = await this.prisma.vehicle.create({
      data: {
        customerId: vehicle.customerId,
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant,
        year: vehicle.year,
        registrationNumber: vehicle.registrationNumber,
        fuelType: vehicle.fuelType,
        color: vehicle.color,
        nickname: vehicle.nickname,
        isDefault: vehicle.isDefault,
        status: vehicle.status,
      },
    });
    return this.mapToDomain(record);
  }

  async findById(id: number): Promise<Vehicle | null> {
    const record = await this.prisma.vehicle.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByPublicId(publicId: string): Promise<Vehicle | null> {
    const record = await this.prisma.vehicle.findUnique({ where: { publicId } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByCustomerAndRegistration(customerId: number, registrationNumber: string): Promise<Vehicle | null> {
    const record = await this.prisma.vehicle.findFirst({
      where: {
        customerId,
        registrationNumber: registrationNumber.trim().toUpperCase(),
        deletedAt: null,
      },
    });
    return record ? this.mapToDomain(record) : null;
  }

  async listByCustomerId(customerId: number): Promise<Vehicle[]> {
    const records = await this.prisma.vehicle.findMany({
      where: { customerId, deletedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return records.map((record: any) => this.mapToDomain(record));
  }

  async update(vehicle: Vehicle): Promise<Vehicle> {
    const record = await this.prisma.vehicle.update({
      where: { id: vehicle.id },
      data: {
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant,
        year: vehicle.year,
        registrationNumber: vehicle.registrationNumber,
        fuelType: vehicle.fuelType,
        color: vehicle.color,
        nickname: vehicle.nickname,
        isDefault: vehicle.isDefault,
        status: vehicle.status,
        deletedAt: vehicle.deletedAt,
      },
    });
    return this.mapToDomain(record);
  }

  async unsetCustomerDefaultVehicles(customerId: number, excludeVehicleId?: number): Promise<void> {
    await this.prisma.vehicle.updateMany({
      where: {
        customerId,
        id: excludeVehicleId ? { not: excludeVehicleId } : undefined,
      },
      data: { isDefault: false },
    });
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.vehicle.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        deletedAt: new Date(),
        isDefault: false,
      },
    });
  }
}
