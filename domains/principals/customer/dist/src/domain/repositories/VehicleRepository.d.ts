import { Vehicle } from '../entities/Vehicle.js';
export interface VehicleRepository {
    findById(id: number): Promise<Vehicle | null>;
    findByUserId(userId: number): Promise<Vehicle[]>;
    create(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle>;
}
