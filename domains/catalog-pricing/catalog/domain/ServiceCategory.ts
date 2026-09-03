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
    if (data.id !== undefined) this.id = data.id;
    if (data.publicId !== undefined) this.publicId = data.publicId;
    this.name = data.name!;
    this.slug = data.slug!;
    this.description = data.description ?? null;
    this.iconUrl = data.iconUrl ?? null;
    this.sortOrder = data.sortOrder ?? 0;
    this.isActive = data.isActive ?? true;
    if (data.createdAt !== undefined) this.createdAt = data.createdAt;
    if (data.updatedAt !== undefined) this.updatedAt = data.updatedAt;
    if (data.deletedAt !== undefined) this.deletedAt = data.deletedAt;
  }
}
