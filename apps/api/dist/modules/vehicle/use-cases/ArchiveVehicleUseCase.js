export class ArchiveVehicleUseCase {
    vehicleRepository;
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute(publicId, customerId) {
        const vehicle = await this.vehicleRepository.findByPublicId(publicId);
        if (!vehicle || vehicle.customerId !== customerId) {
            throw new Error('Vehicle not found or unauthorized');
        }
        await this.vehicleRepository.softDelete(vehicle.id);
    }
}
//# sourceMappingURL=ArchiveVehicleUseCase.js.map