import { z } from 'zod';
export const createCheckoutSchema = z.object({
    bookingPublicId: z.string().min(1, 'Booking public ID is required'),
});
//# sourceMappingURL=payment.dto.js.map