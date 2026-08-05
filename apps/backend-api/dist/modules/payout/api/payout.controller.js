import { ResponseHelper } from '@carbroz/common';
import { markPayoutPaidSchema } from '../dtos/payout.dto.js';
export class PayoutController {
    listPartnerPayoutsUseCase;
    processPayoutBatchUseCase;
    markPayoutPaidUseCase;
    constructor(listPartnerPayoutsUseCase, processPayoutBatchUseCase, markPayoutPaidUseCase) {
        this.listPartnerPayoutsUseCase = listPartnerPayoutsUseCase;
        this.processPayoutBatchUseCase = processPayoutBatchUseCase;
        this.markPayoutPaidUseCase = markPayoutPaidUseCase;
    }
    async listPartnerPayouts(request, reply) {
        const partnerId = request.user?.partnerId || request.user?.id || 1;
        const payouts = await this.listPartnerPayoutsUseCase.execute(partnerId);
        return reply.send(ResponseHelper.success(payouts));
    }
    async processPayoutBatch(request, reply) {
        const count = await this.processPayoutBatchUseCase.execute();
        return reply.send(ResponseHelper.success({ processedCount: count }, `${count} partner payouts approved and moved to processing`));
    }
    async markPayoutPaid(request, reply) {
        const body = markPayoutPaidSchema.parse(request.body);
        const payout = await this.markPayoutPaidUseCase.execute({
            publicId: request.params.publicId,
            externalReference: body.externalReference,
        });
        return reply.send(ResponseHelper.success(payout, 'Partner payout marked as paid'));
    }
}
//# sourceMappingURL=payout.controller.js.map