import { ServiceAddon } from './ServiceAddon.js';
export declare class Service {
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
    constructor(data: Partial<Service>);
}
