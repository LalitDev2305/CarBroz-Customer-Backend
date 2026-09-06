import { toExecutionContext } from '../../../bootstrap/lifecycle/toExecutionContext.js';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { ExecutionContext } from '@carbroz/foundation-kernel';
import { FastifyRequest, FastifyReply } from 'fastify';
import { VerifyPartnerUseCase, PartnerStatus } from '@carbroz/domain-partner';
import { verifyPartnerSchema } from '../dto/admin-partner.dto.js';


/** AdminPartnerController is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export class AdminPartnerController {
  public verifyPartner = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = verifyPartnerSchema.parse(request.body);
    const params = request.params as { id: string };
    const context = toExecutionContext(request);
    const useCase = request.diScope.resolve<VerifyPartnerUseCase>('verifyPartnerUseCase');
    const result = await useCase.execute({
      context, 
      data: {
        partnerId: params.id,
        status: input.status as PartnerStatus
      }
    });
    return reply.status(200).send(ResponseHelper.success(result, "Partner status updated successfully"));
  };
}
