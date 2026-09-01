import { IVehicleRepository, Vehicle } from '@carbroz/domain-garage';

export class ListCustomerVehiclesUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(customerId: number): Promise<Vehicle[]> {
    return this.vehicleRepository.listByCustomerId(customerId);
  }
}
