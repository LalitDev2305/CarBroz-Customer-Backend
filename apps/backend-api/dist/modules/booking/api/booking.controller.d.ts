import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateBookingUseCase } from '../use-cases/CreateBookingUseCase.js';
import { ConfirmBookingUseCase } from '../use-cases/ConfirmBookingUseCase.js';
import { AssignPartnerToBookingUseCase } from '../use-cases/AssignPartnerToBookingUseCase.js';
import { TransitionBookingStatusUseCase } from '../use-cases/TransitionBookingStatusUseCase.js';
import { CancelBookingUseCase } from '../use-cases/CancelBookingUseCase.js';
import { ExpirePendingBookingsUseCase } from '../use-cases/ExpirePendingBookingsUseCase.js';
export declare class BookingController {
    private readonly createBookingUseCase;
    private readonly confirmBookingUseCase;
    private readonly assignPartnerToBookingUseCase;
    private readonly transitionBookingStatusUseCase;
    private readonly cancelBookingUseCase;
    private readonly expirePendingBookingsUseCase;
    constructor(createBookingUseCase: CreateBookingUseCase, confirmBookingUseCase: ConfirmBookingUseCase, assignPartnerToBookingUseCase: AssignPartnerToBookingUseCase, transitionBookingStatusUseCase: TransitionBookingStatusUseCase, cancelBookingUseCase: CancelBookingUseCase, expirePendingBookingsUseCase: ExpirePendingBookingsUseCase);
    createBooking(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    confirmBooking(request: FastifyRequest<{
        Params: {
            publicId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    assignPartner(request: FastifyRequest<{
        Params: {
            publicId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    transitionStatus(request: FastifyRequest<{
        Params: {
            publicId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    cancelBooking(request: FastifyRequest<{
        Params: {
            publicId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    expireBookings(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
