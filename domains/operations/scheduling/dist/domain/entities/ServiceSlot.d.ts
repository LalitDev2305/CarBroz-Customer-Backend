export interface ServiceSlot {
    id: number;
    serviceId: number;
    partnerId?: number | null;
    startTime: Date;
    endTime: Date;
    capacity: number;
    bookedCount: number;
    isAvailable: boolean;
}
