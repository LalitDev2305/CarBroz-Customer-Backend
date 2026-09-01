import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterIndividualPartnerUseCase } from '../use-cases/RegisterIndividualPartnerUseCase.js';
import { RegisterOrganizationPartnerUseCase } from '../use-cases/RegisterOrganizationPartnerUseCase.js';
import { GetPartnerProfileUseCase } from '../use-cases/GetPartnerProfileUseCase.js';
import { registerIndividualPartnerSchema, registerOrganizationPartnerSchema } from '../dtos/partner.dto.js';
import { ResponseHelper, IRequestContext } from '@carbroz/common';

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
