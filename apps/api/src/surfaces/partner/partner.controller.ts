import { ResponseHelper } from '../../transport/response/ResponseHelper.js';
import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterIndividualPartnerUseCase } from '@carbroz/domain-partner';
import { RegisterOrganizationPartnerUseCase } from '@carbroz/domain-partner';
import { GetPartnerProfileUseCase } from '@carbroz/domain-partner';
import { registerIndividualPartnerSchema, registerOrganizationPartnerSchema } from './dto/partner.dto.js';
import { type IRequestContext } from '@carbroz/foundation-kernel';

export class PartnerController {
  public registerIndividual = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = registerIndividualPartnerSchema.parse(request.body);
    const context = {
      traceId: request.traceId,
      authenticatedUser: request.user as any
    } as IRequestContext;
    const useCase = request.diScope.resolve<RegisterIndividualPartnerUseCase>('registerIndividualPartnerUseCase');
    const result = await useCase.execute({ context, data: input });
    return reply.status(201).send(ResponseHelper.success(result, "Partner registered successfully"));
  };

  public registerOrganization = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = registerOrganizationPartnerSchema.parse(request.body);
    const context = {
      traceId: request.traceId,
      authenticatedUser: request.user as any
    } as IRequestContext;
    const useCase = request.diScope.resolve<RegisterOrganizationPartnerUseCase>('registerOrganizationPartnerUseCase');
    const result = await useCase.execute({ context, data: input });
    return reply.status(201).send(ResponseHelper.success(result, "Partner registered successfully"));
  };

  public getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const context = {
      traceId: request.traceId,
      authenticatedUser: request.user as any
    } as IRequestContext;
    const useCase = request.diScope.resolve<GetPartnerProfileUseCase>('getPartnerProfileUseCase');
    const result = await useCase.execute({ context });
    return reply.status(200).send(ResponseHelper.success(result, "Partner profile retrieved"));
  };
}
