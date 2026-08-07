export interface SlotQueryInput {
    targetDate: string;
    serviceDurationMinutes: number;
    travelBufferMinutes?: number;
    partnerId?: number;
    latitude?: number;
    longitude?: number;
}
export interface AvailableSlot {
    slotId: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    partnerId: number;
    capacityRemaining: number;
}
export declare class GetAvailableSlotsQueryHandler {
    execute(input: SlotQueryInput): Promise<AvailableSlot[]>;
}
