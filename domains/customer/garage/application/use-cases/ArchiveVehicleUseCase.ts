import type { IVehicleRepository } from '../../domain/repositories/IVehicleRepository.js';

export class ArchiveVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(publicId: string, customerId: number): Promise<void> {
    const vehicle = await this.vehicleRepository.findByPublicId(publicId);
    if (!vehicle || vehicle.customerId !== customerId) {
      throw new Error('Vehicle not found or unauthorized');
    }

    await this.vehicleRepository.softDelete(vehicle.id!);
  }
}
