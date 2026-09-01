import { IVehicleRepository, Vehicle } from '@carbroz/domain-garage';

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

export class CreateVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(input: CreateVehicleInput): Promise<Vehicle> {
    const existing = await this.vehicleRepository.findByCustomerAndRegistration(input.customerId, input.registrationNumber);
    if (existing) {
      throw new Error(`Vehicle with registration ${input.registrationNumber} already registered for this customer`);
    }

    if (input.isDefault) {
      await this.vehicleRepository.unsetCustomerDefaultVehicles(input.customerId);
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
