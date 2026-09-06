import type { Vehicle } from '../Vehicle.js';

/** IVehicleRepository is an exported domains/customer contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IVehicleRepository {
  create(vehicle: Vehicle): Promise<Vehicle>;
  findById(id: number): Promise<Vehicle | null>;
  findByPublicId(publicId: string): Promise<Vehicle | null>;
  findByCustomerAndRegistration(customerId: number, registrationNumber: string): Promise<Vehicle | null>;
  listByCustomerId(customerId: number): Promise<Vehicle[]>;
  update(vehicle: Vehicle): Promise<Vehicle>;
  unsetCustomerDefaultVehicles(customerId: number, excludeVehicleId?: number): Promise<void>;
  softDelete(id: number): Promise<void>;
}
