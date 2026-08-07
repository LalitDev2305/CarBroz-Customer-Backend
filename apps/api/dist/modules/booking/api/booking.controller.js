import { ResponseHelper } from '@carbroz/foundation-kernel';
import { assignPartnerSchema, cancelBookingSchema, createBookingSchema, transitionStatusSchema } from '../dtos/booking.dto.js';
export class BookingController {
    createBookingUseCase;
    confirmBookingUseCase;
    assignPartnerToBookingUseCase;
    transitionBookingStatusUseCase;
    cancelBookingUseCase;
    expirePendingBookingsUseCase;
    constructor(createBookingUseCase, confirmBookingUseCase, assignPartnerToBookingUseCase, transitionBookingStatusUseCase, cancelBookingUseCase, expirePendingBookingsUseCase) {
        this.createBookingUseCase = createBookingUseCase;
        this.confirmBookingUseCase = confirmBookingUseCase;
        this.assignPartnerToBookingUseCase = assignPartnerToBookingUseCase;
        this.transitionBookingStatusUseCase = transitionBookingStatusUseCase;
        this.cancelBookingUseCase = cancelBookingUseCase;
        this.expirePendingBookingsUseCase = expirePendingBookingsUseCase;
    }
    async createBooking(request, reply) {
        const customerId = request.user?.customerId || request.user?.id || 1;
        const body = createBookingSchema.parse(request.body);
        const booking = await this.createBookingUseCase.execute({
            ...body,
            customerId,
            slotStartTime: new Date(body.slotStartTime),
            slotEndTime: new Date(body.slotEndTime),
        });
        return reply.status(201).send(ResponseHelper.created(booking, 'Booking slot reserved'));
    }
    async confirmBooking(request, reply) {
        const customerId = request.user?.customerId || request.user?.id || 1;
        const booking = await this.confirmBookingUseCase.execute(request.params.publicId, customerId);
        return reply.send(ResponseHelper.success(booking, 'Booking confirmed'));
    }
    async assignPartner(request, reply) {
        const adminUserId = request.user?.id || 1;
        const body = assignPartnerSchema.parse(request.body);
        const booking = await this.assignPartnerToBookingUseCase.execute(request.params.publicId, body.partnerId, adminUserId);
        return reply.send(ResponseHelper.success(booking, 'Partner assigned successfully'));
    }
    async transitionStatus(request, reply) {
        const actorId = request.user?.id || 1;
        const body = transitionStatusSchema.parse(request.body);
        const booking = await this.transitionBookingStatusUseCase.execute({
            bookingPublicId: request.params.publicId,
            targetStatus: body.targetStatus,
            actorId,
        });
        return reply.send(ResponseHelper.success(booking, `Booking status updated to ${body.targetStatus}`));
    }
    async cancelBooking(request, reply) {
        const actorId = request.user?.id || 1;
        const isAdmin = request.user?.isAdmin || false;
        const body = cancelBookingSchema.parse(request.body);
        const booking = await this.cancelBookingUseCase.execute({
            bookingPublicId: request.params.publicId,
            actorId,
            reason: body.reason,
            isAdmin,
        });
        return reply.send(ResponseHelper.success(booking, 'Booking cancelled'));
    }
    async expireBookings(request, reply) {
        const count = await this.expirePendingBookingsUseCase.execute();
        return reply.send(ResponseHelper.success({ expiredCount: count }, `${count} expired bookings processed`));
    }
}
//# sourceMappingURL=booking.controller.js.map