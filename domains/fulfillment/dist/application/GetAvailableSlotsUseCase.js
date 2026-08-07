export class GetAvailableSlotsUseCase {
    async execute(input) {
        const travelBuffer = input.travelBufferMinutes || 30;
        const totalSlotDuration = input.serviceDurationMinutes + travelBuffer;
        const baseDate = new Date(input.targetDate);
        // Standard working hours: 09:00 to 18:00
        const startHour = 9;
        const endHour = 18;
        const slots = [];
        let currentMinutes = startHour * 60;
        const endMinutes = endHour * 60;
        let index = 1;
        while (currentMinutes + totalSlotDuration <= endMinutes) {
            const slotStart = new Date(baseDate);
            slotStart.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0);
            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + input.serviceDurationMinutes);
            slots.push({
                slotId: `SLOT_${input.targetDate}_${index++}`,
                startTime: slotStart.toISOString(),
                endTime: slotEnd.toISOString(),
                isAvailable: true,
                partnerId: input.partnerId || 101,
                capacityRemaining: 3, // Capacity per slot
            });
            // Advance by 60 minute increments
            currentMinutes += 60;
        }
        return slots;
    }
}
//# sourceMappingURL=GetAvailableSlotsUseCase.js.map