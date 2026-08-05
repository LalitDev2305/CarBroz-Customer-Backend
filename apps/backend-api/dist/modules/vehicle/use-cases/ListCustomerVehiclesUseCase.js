export class ListCustomerVehiclesUseCase {
    vehicleRepository;
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute(customerId) {
        return await this.vehicleRepository.listByCustomerId(customerId);
    }
}
//# sourceMappingURL=ListCustomerVehiclesUseCase.js.map