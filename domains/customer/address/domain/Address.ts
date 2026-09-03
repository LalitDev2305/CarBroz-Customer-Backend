export class Address {
  id?: number;
  publicId?: string;
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

  constructor(data: Partial<Address>) {
    if (data.id !== undefined) this.id = data.id;
    if (data.publicId !== undefined) this.publicId = data.publicId;
    this.userId = data.userId!;
    this.label = data.label ?? null;
    this.addressLine1 = data.addressLine1!;
    this.addressLine2 = data.addressLine2 ?? null;
    this.city = data.city!;
    this.state = data.state!;
    this.postalCode = data.postalCode!;
    this.country = data.country!;
    this.latitude = data.latitude ?? null;
    this.longitude = data.longitude ?? null;
    this.isDefault = data.isDefault ?? false;
    if (data.createdAt !== undefined) this.createdAt = data.createdAt;
    if (data.updatedAt !== undefined) this.updatedAt = data.updatedAt;
    if (data.deletedAt !== undefined) this.deletedAt = data.deletedAt;
  }
}
