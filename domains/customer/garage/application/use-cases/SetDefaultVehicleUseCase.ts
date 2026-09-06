import { DomainError } from "@carbroz/foundation-kernel";
import type { Vehicle } from "../../domain/Vehicle.js";
import type { IVehicleRepository } from "../../domain/repositories/IVehicleRepository.js";

/** SetDefaultVehicleUseCase is an exported domains/customer contract/implementation; see the owning README for lifecycle and extension rules. */
export class SetDefaultVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(publicId: string, customerId: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findByPublicId(publicId);
    if (
      !vehicle ||
      vehicle.customerId !== customerId ||
      !vehicle.isBookable()
    ) {
      throw new DomainError("Vehicle not found or unauthorized");
    }

    await this.vehicleRepository.unsetCustomerDefaultVehicles(
      customerId,
      vehicle.id,
    );
    vehicle.setDefault(true);
    return this.vehicleRepository.update(vehicle);
  }
}
