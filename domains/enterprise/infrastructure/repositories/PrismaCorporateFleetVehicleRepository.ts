import { PrismaClient } from '@prisma/client';
import { ICorporateFleetVehicleRepository, CorporateFleetVehicle } from '@carbroz/common';

export class PrismaCorporateFleetVehicleRepository implements ICorporateFleetVehicleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(record: any): CorporateFleetVehicle {
    return new CorporateFleetVehicle({
      id: record.id,
      publicId: record.publicId,
      corporateAccountId: record.corporateAccountId,
      vehicleId: record.vehicleId,
      department: record.department,
      costCenter: record.costCenter,
      monthlyCapPaise: record.monthlyCapPaise,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async create(fleetVehicle: CorporateFleetVehicle): Promise<CorporateFleetVehicle> {
    const record = await (this.prisma as any).corporateFleetVehicle.create({
      data: {
        corporateAccountId: fleetVehicle.corporateAccountId,
        vehicleId: fleetVehicle.vehicleId,
        department: fleetVehicle.department,
        costCenter: fleetVehicle.costCenter,
        monthlyCapPaise: fleetVehicle.monthlyCapPaise,
        status: fleetVehicle.status,
      },
    });
    return this.mapToDomain(record);
  }

  async update(fleetVehicle: CorporateFleetVehicle): Promise<CorporateFleetVehicle> {
    const record = await (this.prisma as any).corporateFleetVehicle.update({
      where: { id: fleetVehicle.id },
      data: {
        department: fleetVehicle.department,
        costCenter: fleetVehicle.costCenter,
        monthlyCapPaise: fleetVehicle.monthlyCapPaise,
        status: fleetVehicle.status,
      },
    });
    return this.mapToDomain(record);
  }

  async findById(id: number): Promise<CorporateFleetVehicle | null> {
    const record = await (this.prisma as any).corporateFleetVehicle.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByPublicId(publicId: string): Promise<CorporateFleetVehicle | null> {
    const record = await (this.prisma as any).corporateFleetVehicle.findUnique({ where: { publicId } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByAccountAndVehicle(corporateAccountId: number, vehicleId: number): Promise<CorporateFleetVehicle | null> {
    const record = await (this.prisma as any).corporateFleetVehicle.findUnique({
      where: { corporateAccountId_vehicleId: { corporateAccountId, vehicleId } },
    });
    return record ? this.mapToDomain(record) : null;
  }

  async findByVehicleId(vehicleId: number): Promise<CorporateFleetVehicle | null> {
    const record = await (this.prisma as any).corporateFleetVehicle.findFirst({
      where: { vehicleId, status: 'ACTIVE' },
    });
    return record ? this.mapToDomain(record) : null;
  }

  async listByAccountId(corporateAccountId: number): Promise<CorporateFleetVehicle[]> {
    const records = await (this.prisma as any).corporateFleetVehicle.findMany({
      where: { corporateAccountId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: any) => this.mapToDomain(r));
  }

  async delete(id: number): Promise<void> {
    await (this.prisma as any).corporateFleetVehicle.delete({ where: { id } });
  }
}
