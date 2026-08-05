import { CorporateFleetVehicle, } from '@carbroz/common';
export class EnrollFleetVehicleUseCase {
    corporateAccountRepo;
    fleetVehicleRepo;
    vehicleRepository;
    auditLogService;
    constructor(corporateAccountRepo, fleetVehicleRepo, vehicleRepository, auditLogService) {
        this.corporateAccountRepo = corporateAccountRepo;
        this.fleetVehicleRepo = fleetVehicleRepo;
        this.vehicleRepository = vehicleRepository;
        this.auditLogService = auditLogService;
    }
    async execute(dto, actorUserId) {
        const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
        if (!account) {
            throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
        }
        const vehicle = await this.vehicleRepository.findByRegistrationNumber
            ? await this.vehicleRepository.findByRegistrationNumber(dto.registrationNumber)
            : null;
        if (!vehicle) {
            throw new Error(`Vehicle with registration number ${dto.registrationNumber} not found in garage`);
        }
        const existingEnrollment = await this.fleetVehicleRepo.findByAccountAndVehicle(account.id, vehicle.id);
        if (existingEnrollment) {
            throw new Error(`Vehicle ${dto.registrationNumber} is already enrolled in this corporate fleet`);
        }
        const fleetVehicle = new CorporateFleetVehicle({
            corporateAccountId: account.id,
            vehicleId: vehicle.id,
            department: dto.department,
            costCenter: dto.costCenter,
            monthlyCapPaise: dto.monthlyCapPaise != null ? BigInt(dto.monthlyCapPaise) : null,
            status: 'ACTIVE',
        });
        const savedFleetVehicle = await this.fleetVehicleRepo.create(fleetVehicle);
        await this.auditLogService.log({
            actorId: actorUserId,
            actorType: 'CUSTOMER',
            action: 'FLEET_VEHICLE_ENROLL',
            resource: 'CorporateFleetVehicle',
            resourcePublicId: savedFleetVehicle.publicId,
            newValue: { corporateAccountId: account.id, vehicleId: vehicle.id, registrationNumber: dto.registrationNumber },
        });
        return savedFleetVehicle;
    }
}
//# sourceMappingURL=EnrollFleetVehicleUseCase.js.map