export class ServiceCategory {
  id?: number;
  publicId?: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;

  constructor(data: Partial<ServiceCategory>) {
    this.id = data.id;
    this.publicId = data.publicId;
    this.name = data.name!;
    this.slug = data.slug!;
    this.description = data.description ?? null;
    this.iconUrl = data.iconUrl ?? null;
    this.sortOrder = data.sortOrder ?? 0;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }
}
