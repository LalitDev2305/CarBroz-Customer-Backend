import { DomainError } from "@carbroz/foundation-kernel";
import { Vehicle } from "../../domain/Vehicle.js";
import type { IVehicleRepository } from "../../domain/repositories/IVehicleRepository.js";

/** CreateVehicleInput is an exported domains/customer contract/implementation; see the owning README for lifecycle and extension rules. */
export interface CreateVehicleInput {
  customerId: number;
  make: string;
  model: string;
  variant?: string;
  year: number;
  registrationNumber: string;
  fuelType: string;
  color?: string;
  nickname?: string;
  isDefault?: boolean;
}

/** CreateVehicleUseCase is an exported domains/customer contract/implementation; see the owning README for lifecycle and extension rules. */
export class CreateVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(input: CreateVehicleInput): Promise<Vehicle> {
    const existing = await this.vehicleRepository.findByCustomerAndRegistration(
      input.customerId,
      input.registrationNumber,
    );
    if (existing) {
      throw new DomainError(
        `Vehicle with registration ${input.registrationNumber} already registered for this customer`,
      );
    }

    if (input.isDefault) {
      await this.vehicleRepository.unsetCustomerDefaultVehicles(
        input.customerId,
      );
    }

    const vehicle = new Vehicle({
      customerId: input.customerId,
      make: input.make,
      model: input.model,
      variant: input.variant,
      year: input.year,
      registrationNumber: input.registrationNumber,
      fuelType: input.fuelType,
      color: input.color,
      nickname: input.nickname,
      isDefault: input.isDefault ?? false,
    });

    return this.vehicleRepository.create(vehicle);
  }
}
