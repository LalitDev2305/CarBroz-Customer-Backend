import { verifyPartnerSchema } from '../../partner/dtos/partner.dto.js';
import { ResponseHelper } from '@carbroz/common';
export class AdminPartnerController {
    verifyPartner = async (request, reply) => {
        const input = verifyPartnerSchema.parse(request.body);
        const params = request.params;
        const context = {
            traceId: request.traceId,
            authenticatedUser: request.user
        };
        const useCase = request.diScope.resolve('verifyPartnerUseCase');
        const result = await useCase.execute({
            context,
            data: {
                partnerId: params.id,
                status: input.status
            }
        });
        return reply.status(200).send(ResponseHelper.success(result, "Partner status updated successfully"));
    };
}
//# sourceMappingURL=admin-partner.controller.js.map