import type { Vehicle } from '../../domain/Vehicle.js';
import type { IVehicleRepository } from '../../domain/repositories/IVehicleRepository.js';

/** ListCustomerVehiclesUseCase is an exported domains/customer contract/implementation; see the owning README for lifecycle and extension rules. */
export class ListCustomerVehiclesUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(customerId: number): Promise<Vehicle[]> {
    return this.vehicleRepository.listByCustomerId(customerId);
  }
}
