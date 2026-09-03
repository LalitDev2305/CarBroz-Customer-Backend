export class ServiceAddon {
  id?: number;
  publicId?: string;
  serviceId: number;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;

  constructor(data: Partial<ServiceAddon>) {
    if (data.id !== undefined) this.id = data.id;
    if (data.publicId !== undefined) this.publicId = data.publicId;
    this.serviceId = data.serviceId!;
    this.name = data.name!;
    this.description = data.description ?? null;
    this.price = data.price ?? 0;
    this.isActive = data.isActive ?? true;
    if (data.createdAt !== undefined) this.createdAt = data.createdAt;
    if (data.updatedAt !== undefined) this.updatedAt = data.updatedAt;
    if (data.deletedAt !== undefined) this.deletedAt = data.deletedAt;
  }
}
