/** CustomerProfilePersistenceRecord is an exported domains/customer contract/implementation; see the owning README for lifecycle and extension rules. */
export interface CustomerProfilePersistenceRecord {
  id: number;
  publicId?: string | null;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  marketingOptIn: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

/** CustomerProfilePersistenceDelegate is an exported domains/customer contract/implementation; see the owning README for lifecycle and extension rules. */
export interface CustomerProfilePersistenceDelegate {
  findUnique(args: unknown): Promise<CustomerProfilePersistenceRecord | null>;
  findMany(args: unknown): Promise<CustomerProfilePersistenceRecord[]>;
  update(args: unknown): Promise<CustomerProfilePersistenceRecord>;
  create(args: unknown): Promise<CustomerProfilePersistenceRecord>;
}

/** CustomerProfilePersistenceClient is an exported domains/customer contract/implementation; see the owning README for lifecycle and extension rules. */
export interface CustomerProfilePersistenceClient {
  customerProfile: CustomerProfilePersistenceDelegate;
}
