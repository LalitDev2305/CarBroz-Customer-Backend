import { FastifyRequest, FastifyReply } from 'fastify';
import { VerifyPartnerUseCase } from '../../partner/use-cases/VerifyPartnerUseCase.js';
import { verifyPartnerSchema } from '../../partner/dtos/partner.dto.js';
import { ResponseHelper, IRequestContext } from '@carbroz/common';

export class AdminPartnerController {
  public verifyPartner = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = verifyPartnerSchema.parse(request.body);
    const params = request.params as { id: string };
    const context = {
      traceId: request.traceId,
      authenticatedUser: request.user as any
    } as IRequestContext;
    const useCase = request.diScope.resolve<VerifyPartnerUseCase>('verifyPartnerUseCase');
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
