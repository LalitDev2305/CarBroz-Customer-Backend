import { IVehicleRepository, Vehicle } from '@carbroz/common';

export class ListCustomerVehiclesUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(customerId: number): Promise<Vehicle[]> {
    return await this.vehicleRepository.listByCustomerId(customerId);
  }
}
