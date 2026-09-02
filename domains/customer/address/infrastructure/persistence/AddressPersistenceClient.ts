export interface AddressPersistenceRecord {
  id: number;
  publicId?: string | null;
  userId: number;
  label: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface AddressPersistenceDelegate {
  findUnique(args: unknown): Promise<AddressPersistenceRecord | null>;
  findFirst(args: unknown): Promise<AddressPersistenceRecord | null>;
  findMany(args: unknown): Promise<AddressPersistenceRecord[]>;
  updateMany(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<AddressPersistenceRecord>;
  create(args: unknown): Promise<AddressPersistenceRecord>;
}

export interface AddressTransactionClient {
  address: AddressPersistenceDelegate;
}

export interface AddressPersistenceClient extends AddressTransactionClient {
  $transaction<T>(callback: (tx: AddressTransactionClient) => Promise<T>): Promise<T>;
}
