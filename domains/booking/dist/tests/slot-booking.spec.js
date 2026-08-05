import { describe, it, expect } from 'vitest';
import { GetAvailableSlotsUseCase } from '../application/GetAvailableSlotsUseCase.js';
describe('Slot Booking Engine', () => {
    it('GetAvailableSlotsUseCase should compute available slots for a target date', async () => {
        const useCase = new GetAvailableSlotsUseCase();
        const slots = await useCase.execute({
            targetDate: '2026-08-10',
            serviceDurationMinutes: 60,
            travelBufferMinutes: 30,
            partnerId: 101,
        });
        expect(slots.length).toBeGreaterThan(0);
        const firstSlot = slots[0];
        expect(firstSlot).toBeDefined();
        if (firstSlot) {
            expect(firstSlot.isAvailable).toBe(true);
            expect(firstSlot.partnerId).toBe(101);
            expect(firstSlot.capacityRemaining).toBeGreaterThan(0);
        }
    });
});
//# sourceMappingURL=slot-booking.spec.js.map