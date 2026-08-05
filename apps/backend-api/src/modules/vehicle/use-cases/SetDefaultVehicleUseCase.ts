import { IVehicleRepository, Vehicle } from '@carbroz/common';

export class SetDefaultVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(publicId: string, customerId: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findByPublicId(publicId);
    if (!vehicle || vehicle.customerId !== customerId || !vehicle.isBookable()) {
      throw new Error('Vehicle not found or unauthorized');
    }

    await this.vehicleRepository.unsetCustomerDefaultVehicles(customerId, vehicle.id);
    vehicle.setDefault(true);
    return await this.vehicleRepository.update(vehicle);
  }
}
