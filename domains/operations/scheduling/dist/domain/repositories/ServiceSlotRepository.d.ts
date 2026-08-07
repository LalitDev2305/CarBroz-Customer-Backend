import { ServiceSlot } from '../entities/ServiceSlot.js';
export interface ServiceSlotRepository {
    findAvailableSlots(serviceId: number, date: Date): Promise<ServiceSlot[]>;
    lockSlot(slotId: number): Promise<boolean>;
}
