import { CorporateFleetVehicle } from '../CorporateFleetVehicle.js';

/** ICorporateFleetVehicleRepository is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ICorporateFleetVehicleRepository {
  create(fleetVehicle: CorporateFleetVehicle): Promise<CorporateFleetVehicle>;
  update(fleetVehicle: CorporateFleetVehicle): Promise<CorporateFleetVehicle>;
  findById(id: number): Promise<CorporateFleetVehicle | null>;
  findByPublicId(publicId: string): Promise<CorporateFleetVehicle | null>;
  findByAccountAndVehicle(corporateAccountId: number, vehicleId: number): Promise<CorporateFleetVehicle | null>;
  findByVehicleId(vehicleId: number): Promise<CorporateFleetVehicle | null>;
  listByAccountId(corporateAccountId: number): Promise<CorporateFleetVehicle[]>;
  delete(id: number): Promise<void>;
}
