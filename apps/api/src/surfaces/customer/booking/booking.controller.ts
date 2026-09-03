import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { CreateBookingUseCase } from '@carbroz/domain-booking';
import { ConfirmBookingUseCase } from '@carbroz/domain-booking';
import { AssignPartnerToBookingUseCase } from '@carbroz/domain-booking';
import { TransitionBookingStatusUseCase } from '@carbroz/domain-booking';
import { CancelBookingUseCase } from '@carbroz/domain-booking';
import { ExpirePendingBookingsUseCase } from '@carbroz/domain-booking';
import { assignPartnerSchema, cancelBookingSchema, createBookingSchema, transitionStatusSchema } from './dto/booking.dto.js';

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
