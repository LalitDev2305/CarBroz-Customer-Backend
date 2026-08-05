import { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseHelper } from '@carbroz/common';
import { CreateBookingUseCase } from '../use-cases/CreateBookingUseCase.js';
import { ConfirmBookingUseCase } from '../use-cases/ConfirmBookingUseCase.js';
import { AssignPartnerToBookingUseCase } from '../use-cases/AssignPartnerToBookingUseCase.js';
import { TransitionBookingStatusUseCase } from '../use-cases/TransitionBookingStatusUseCase.js';
import { CancelBookingUseCase } from '../use-cases/CancelBookingUseCase.js';
import { ExpirePendingBookingsUseCase } from '../use-cases/ExpirePendingBookingsUseCase.js';
import { assignPartnerSchema, cancelBookingSchema, createBookingSchema, transitionStatusSchema } from '../dtos/booking.dto.js';

export class BookingController {
  constructor(
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly confirmBookingUseCase: ConfirmBookingUseCase,
    private readonly assignPartnerToBookingUseCase: AssignPartnerToBookingUseCase,
    private readonly transitionBookingStatusUseCase: TransitionBookingStatusUseCase,
    private readonly cancelBookingUseCase: CancelBookingUseCase,
    private readonly expirePendingBookingsUseCase: ExpirePendingBookingsUseCase
  ) {}

  async createBooking(request: FastifyRequest, reply: FastifyReply) {
    const customerId = (request as any).user?.customerId || (request as any).user?.id || 1;
    const body = createBookingSchema.parse(request.body);

    const booking = await this.createBookingUseCase.execute({
      ...body,
      customerId,
      slotStartTime: new Date(body.slotStartTime),
      slotEndTime: new Date(body.slotEndTime),
    });

    return reply.status(201).send(ResponseHelper.created(booking, 'Booking slot reserved'));
  }

  async confirmBooking(request: FastifyRequest<{ Params: { publicId: string } }>, reply: FastifyReply) {
    const customerId = (request as any).user?.customerId || (request as any).user?.id || 1;
    const booking = await this.confirmBookingUseCase.execute(request.params.publicId, customerId);
    return reply.send(ResponseHelper.success(booking, 'Booking confirmed'));
  }

  async assignPartner(request: FastifyRequest<{ Params: { publicId: string } }>, reply: FastifyReply) {
    const adminUserId = (request as any).user?.id || 1;
    const body = assignPartnerSchema.parse(request.body);

    const booking = await this.assignPartnerToBookingUseCase.execute(
      request.params.publicId,
      body.partnerId,
      adminUserId
    );

    return reply.send(ResponseHelper.success(booking, 'Partner assigned successfully'));
  }

  async transitionStatus(request: FastifyRequest<{ Params: { publicId: string } }>, reply: FastifyReply) {
    const actorId = (request as any).user?.id || 1;
    const body = transitionStatusSchema.parse(request.body);

    const booking = await this.transitionBookingStatusUseCase.execute({
      bookingPublicId: request.params.publicId,
      targetStatus: body.targetStatus,
      actorId,
    });

    return reply.send(ResponseHelper.success(booking, `Booking status updated to ${body.targetStatus}`));
  }

  async cancelBooking(request: FastifyRequest<{ Params: { publicId: string } }>, reply: FastifyReply) {
    const actorId = (request as any).user?.id || 1;
    const isAdmin = (request as any).user?.isAdmin || false;
    const body = cancelBookingSchema.parse(request.body);

    const booking = await this.cancelBookingUseCase.execute({
      bookingPublicId: request.params.publicId,
      actorId,
      reason: body.reason,
      isAdmin,
    });

    return reply.send(ResponseHelper.success(booking, 'Booking cancelled'));
  }

  async expireBookings(request: FastifyRequest, reply: FastifyReply) {
    const count = await this.expirePendingBookingsUseCase.execute();
    return reply.send(ResponseHelper.success({ expiredCount: count }, `${count} expired bookings processed`));
  }
}
