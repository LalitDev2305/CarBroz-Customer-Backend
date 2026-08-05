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
    this.id = data.id;
    this.publicId = data.publicId;
    this.serviceId = data.serviceId!;
    this.name = data.name!;
    this.description = data.description ?? null;
    this.price = data.price ?? 0;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }
}
