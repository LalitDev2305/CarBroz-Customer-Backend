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
    this.id = data.id;
    this.publicId = data.publicId;
    this.categoryId = data.categoryId!;
    this.name = data.name!;
    this.slug = data.slug!;
    this.description = data.description ?? null;
    this.imageUrl = data.imageUrl ?? null;
    this.basePrice = data.basePrice ?? 0;
    this.estimatedDurationMinutes = data.estimatedDurationMinutes ?? 60;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
    this.addons = data.addons;
  }
}
