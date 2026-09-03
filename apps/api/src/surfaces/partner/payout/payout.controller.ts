import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ListPartnerPayoutsUseCase } from '@carbroz/domain-financials';
import { ProcessPayoutBatchUseCase } from '@carbroz/domain-financials';
import { MarkPayoutPaidUseCase } from '@carbroz/domain-financials';
import { markPayoutPaidSchema } from '../dtos/payout.dto.js';

export class PayoutController {
  constructor(
    private readonly listPartnerPayoutsUseCase: ListPartnerPayoutsUseCase,
    private readonly processPayoutBatchUseCase: ProcessPayoutBatchUseCase,
    private readonly markPayoutPaidUseCase: MarkPayoutPaidUseCase
  ) {}

  async listPartnerPayouts(request: FastifyRequest, reply: FastifyReply) {
    const partnerId = (request as any).user?.partnerId || (request as any).user?.id || 1;
    const payouts = await this.listPartnerPayoutsUseCase.execute(partnerId);
    return reply.send(ResponseHelper.success(payouts));
  }

  async processPayoutBatch(request: FastifyRequest, reply: FastifyReply) {
    const count = await this.processPayoutBatchUseCase.execute();
    return reply.send(ResponseHelper.success({ processedCount: count }, `${count} partner payouts approved and moved to processing`));
  }

  async markPayoutPaid(request: FastifyRequest<{ Params: { publicId: string } }>, reply: FastifyReply) {
    const body = markPayoutPaidSchema.parse(request.body);
    const payout = await this.markPayoutPaidUseCase.execute({
      publicId: request.params.publicId,
      externalReference: body.externalReference,
    });
    return reply.send(ResponseHelper.success(payout, 'Partner payout marked as paid'));
  }
}
