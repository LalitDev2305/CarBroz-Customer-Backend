import type { FastifyReply, FastifyRequest } from 'fastify';
import type { GetPartnerBootstrapUseCase } from '@carbroz/domain-configuration';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { partnerBootstrapHeadersSchema } from '../dto/partner.bootstrap.dto.js';

/** Partner-only HTTP adapter for the startup/bootstrap contract. */
export class PartnerBootstrapController {
  public get = async (request: FastifyRequest, reply: FastifyReply) => {
    const headers = partnerBootstrapHeadersSchema.parse(request.headers);

    // Bootstrap is public only when no bearer is supplied. If the client supplies a bearer,
    // it must be valid so local session state cannot silently diverge from backend auth truth.
    if (request.headers.authorization && !request.user) {
      await request.jwtVerify();
    }

    const useCase = request.diScope.resolve<GetPartnerBootstrapUseCase>('getPartnerBootstrapUseCase');
    const result = await useCase.execute({
      platform: headers['x-carbroz-platform'],
      appVersion: headers['x-carbroz-app-version'],
      authenticated: Boolean(request.user),
    });

    return reply.status(200).send(
      ResponseHelper.success(result, 'Partner bootstrap completed', request.traceId),
    );
  };
}
