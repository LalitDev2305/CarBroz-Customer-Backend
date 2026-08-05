import { CorporateFleetVehicle } from '@carbroz/common';
export class PrismaCorporateFleetVehicleRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToDomain(record) {
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
    async create(fleetVehicle) {
        const record = await this.prisma.corporateFleetVehicle.create({
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
    async update(fleetVehicle) {
        const record = await this.prisma.corporateFleetVehicle.update({
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
    async findById(id) {
        const record = await this.prisma.corporateFleetVehicle.findUnique({ where: { id } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByPublicId(publicId) {
        const record = await this.prisma.corporateFleetVehicle.findUnique({ where: { publicId } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByAccountAndVehicle(corporateAccountId, vehicleId) {
        const record = await this.prisma.corporateFleetVehicle.findUnique({
            where: { corporateAccountId_vehicleId: { corporateAccountId, vehicleId } },
        });
        return record ? this.mapToDomain(record) : null;
    }
    async findByVehicleId(vehicleId) {
        const record = await this.prisma.corporateFleetVehicle.findFirst({
            where: { vehicleId, status: 'ACTIVE' },
        });
        return record ? this.mapToDomain(record) : null;
    }
    async listByAccountId(corporateAccountId) {
        const records = await this.prisma.corporateFleetVehicle.findMany({
            where: { corporateAccountId },
            orderBy: { createdAt: 'desc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
    async delete(id) {
        await this.prisma.corporateFleetVehicle.delete({ where: { id } });
    }
}
//# sourceMappingURL=PrismaCorporateFleetVehicleRepository.js.map