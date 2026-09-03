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
    if (data.id !== undefined) this.id = data.id;
    if (data.publicId !== undefined) this.publicId = data.publicId;
    this.userId = data.userId!;
    this.firstName = data.firstName ?? null;
    this.lastName = data.lastName ?? null;
    this.dateOfBirth = data.dateOfBirth ?? null;
    this.gender = data.gender ?? null;
    this.marketingOptIn = data.marketingOptIn ?? false;
    if (data.createdAt !== undefined) this.createdAt = data.createdAt;
    if (data.updatedAt !== undefined) this.updatedAt = data.updatedAt;
    if (data.deletedAt !== undefined) this.deletedAt = data.deletedAt;
  }
}
