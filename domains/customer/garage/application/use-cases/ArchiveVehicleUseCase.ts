import type { IVehicleRepository } from '../../domain/repositories/IVehicleRepository.js';

/** ArchiveVehicleUseCase is an exported domains/customer contract/implementation; see the owning README for lifecycle and extension rules. */
export class ArchiveVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(publicId: string, customerId: number): Promise<void> {
    const vehicle = await this.vehicleRepository.findByPublicId(publicId);
    if (!vehicle || vehicle.customerId !== customerId) {
      throw new Error('Vehicle not found or unauthorized');
    }

    await this.vehicleRepository.softDelete(vehicle.id!);
  }
}
