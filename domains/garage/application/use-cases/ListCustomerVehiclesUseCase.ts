import type { Vehicle } from '../../domain/Vehicle.js';
import type { IVehicleRepository } from '../../domain/repositories/IVehicleRepository.js';

export class ListCustomerVehiclesUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(customerId: number): Promise<Vehicle[]> {
    return this.vehicleRepository.listByCustomerId(customerId);
  }
}
