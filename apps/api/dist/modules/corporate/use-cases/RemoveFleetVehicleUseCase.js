export class RemoveFleetVehicleUseCase {
    corporateAccountRepo;
    fleetVehicleRepo;
    auditLogService;
    constructor(corporateAccountRepo, fleetVehicleRepo, auditLogService) {
        this.corporateAccountRepo = corporateAccountRepo;
        this.fleetVehicleRepo = fleetVehicleRepo;
        this.auditLogService = auditLogService;
    }
    async execute(dto, actorUserId) {
        const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
        if (!account) {
            throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
        }
        const fleetVehicle = await this.fleetVehicleRepo.findByPublicId(dto.fleetVehiclePublicId);
        if (!fleetVehicle || fleetVehicle.corporateAccountId !== account.id) {
            throw new Error(`Fleet vehicle not found`);
        }
        fleetVehicle.deactivate();
        await this.fleetVehicleRepo.update(fleetVehicle);
        await this.auditLogService.log({
            actorId: actorUserId,
            actorType: 'CUSTOMER',
            action: 'FLEET_VEHICLE_REMOVE',
            resource: 'CorporateFleetVehicle',
            resourcePublicId: fleetVehicle.publicId,
            oldValue: { status: 'ACTIVE' },
            newValue: { status: 'INACTIVE' },
        });
    }
}
//# sourceMappingURL=RemoveFleetVehicleUseCase.js.map