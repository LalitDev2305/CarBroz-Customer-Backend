export class CustomerProfile {
  id?: number;
  publicId?: string;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  marketingOptIn: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;

  constructor(data: Partial<CustomerProfile>) {
    this.id = data.id;
    this.publicId = data.publicId;
    this.userId = data.userId!;
    this.firstName = data.firstName ?? null;
    this.lastName = data.lastName ?? null;
    this.dateOfBirth = data.dateOfBirth ?? null;
    this.gender = data.gender ?? null;
    this.marketingOptIn = data.marketingOptIn ?? false;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }
}
