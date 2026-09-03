import { ServiceAddon } from './ServiceAddon.js';

export class Service {
  id?: number;
  publicId?: string;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number;
  estimatedDurationMinutes: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  addons?: ServiceAddon[];

  constructor(data: Partial<Service>) {
    if (data.id !== undefined) this.id = data.id;
    if (data.publicId !== undefined) this.publicId = data.publicId;
    this.categoryId = data.categoryId!;
    this.name = data.name!;
    this.slug = data.slug!;
    this.description = data.description ?? null;
    this.imageUrl = data.imageUrl ?? null;
    this.basePrice = data.basePrice ?? 0;
    this.estimatedDurationMinutes = data.estimatedDurationMinutes ?? 60;
    this.isActive = data.isActive ?? true;
    if (data.createdAt !== undefined) this.createdAt = data.createdAt;
    if (data.updatedAt !== undefined) this.updatedAt = data.updatedAt;
    if (data.deletedAt !== undefined) this.deletedAt = data.deletedAt;
    if (data.addons !== undefined) this.addons = data.addons;
  }
}
