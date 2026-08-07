import { FastifyReply, FastifyRequest } from 'fastify';
import { ListPartnerPayoutsUseCase } from '../use-cases/ListPartnerPayoutsUseCase.js';
import { ProcessPayoutBatchUseCase } from '../use-cases/ProcessPayoutBatchUseCase.js';
import { MarkPayoutPaidUseCase } from '../use-cases/MarkPayoutPaidUseCase.js';
export declare class PayoutController {
    private readonly listPartnerPayoutsUseCase;
    private readonly processPayoutBatchUseCase;
    private readonly markPayoutPaidUseCase;
    constructor(listPartnerPayoutsUseCase: ListPartnerPayoutsUseCase, processPayoutBatchUseCase: ProcessPayoutBatchUseCase, markPayoutPaidUseCase: MarkPayoutPaidUseCase);
    listPartnerPayouts(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    processPayoutBatch(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    markPayoutPaid(request: FastifyRequest<{
        Params: {
            publicId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
}
