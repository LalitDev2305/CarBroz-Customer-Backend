export interface BookingPersistenceRecord {
  id: number;
  publicId: string;
  customerId: number;
  partnerId: number | null;
  vehicleId: number;
  addressId: number;
  serviceId: number;
  status: string;
  slotStartTime: Date;
  slotEndTime: Date;
  expiryAt: Date | null;
  totalPricePaise: number;
  cancellationReason: string | null;
  snapshotsJson: unknown;
  statusHistoryJson: unknown;
  createdAt: Date;
  updatedAt: Date;
}

interface BookingPersistenceDelegate {
  create(args: unknown): Promise<BookingPersistenceRecord>;
  findUnique(args: unknown): Promise<BookingPersistenceRecord | null>;
  findFirst(args: unknown): Promise<BookingPersistenceRecord | null>;
  findMany(args: unknown): Promise<BookingPersistenceRecord[]>;
  update(args: unknown): Promise<BookingPersistenceRecord>;
}

export interface BookingPersistenceClient {
  readonly booking: BookingPersistenceDelegate;
}
