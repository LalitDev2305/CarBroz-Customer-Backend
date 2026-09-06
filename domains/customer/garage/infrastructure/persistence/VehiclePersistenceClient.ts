/** VehiclePersistenceRecord is an exported domains/customer contract/implementation; see the owning README for lifecycle and extension rules. */
export interface VehiclePersistenceRecord {
  id: number;
  publicId: string;
  customerId: number;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  registrationNumber: string;
  fuelType: string;
  color: string | null;
  nickname: string | null;
  isDefault: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/** VehiclePersistenceClient is an exported domains/customer contract/implementation; see the owning README for lifecycle and extension rules. */
export interface VehiclePersistenceClient {
  vehicle: {
    create(args: unknown): Promise<VehiclePersistenceRecord>;
    findUnique(args: unknown): Promise<VehiclePersistenceRecord | null>;
    findFirst(args: unknown): Promise<VehiclePersistenceRecord | null>;
    findMany(args: unknown): Promise<VehiclePersistenceRecord[]>;
    update(args: unknown): Promise<VehiclePersistenceRecord>;
    updateMany(args: unknown): Promise<unknown>;
  };
}
