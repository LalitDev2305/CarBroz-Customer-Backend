export class SetDefaultVehicleUseCase {
    vehicleRepository;
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute(publicId, customerId) {
        const vehicle = await this.vehicleRepository.findByPublicId(publicId);
        if (!vehicle || vehicle.customerId !== customerId || !vehicle.isBookable()) {
            throw new Error('Vehicle not found or unauthorized');
        }
        await this.vehicleRepository.unsetCustomerDefaultVehicles(customerId, vehicle.id);
        vehicle.setDefault(true);
        return await this.vehicleRepository.update(vehicle);
    }
}
//# sourceMappingURL=SetDefaultVehicleUseCase.js.map