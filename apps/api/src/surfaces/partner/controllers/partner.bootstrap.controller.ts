import type { FastifyReply, FastifyRequest } from 'fastify';
import type { GetPartnerBootstrapUseCase } from '@carbroz/domain-configuration';
import { emitFlowDiagnostic } from '@carbroz/platform-observability';
import { isDetailedDiagnosticLoggingEnabled } from '../../../bootstrap/config/diagnostic-mode.js';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { partnerBootstrapHeadersSchema } from '../dto/partner.bootstrap.dto.js';

/** Partner-only HTTP adapter for the startup/bootstrap contract. */
export class PartnerBootstrapController {
  public get = async (request: FastifyRequest, reply: FastifyReply) => {
    const detailed = isDetailedDiagnosticLoggingEnabled();
    const correlationId = request.traceId ?? request.id;
    emitFlowDiagnostic(
      detailed,
      correlationId,
      'partnerBootstrapRoutes.GET(/bootstrap)',
      'PartnerBootstrapController.get()',
    );

    const headers = partnerBootstrapHeadersSchema.parse(request.headers);

    // Bootstrap is public only when no bearer is supplied. If the client supplies a bearer,
    // it must be valid so local session state cannot silently diverge from backend auth truth.
    if (request.headers.authorization && !request.user) {
      emitFlowDiagnostic(
        detailed,
        correlationId,
        'PartnerBootstrapController.get()',
        'FastifyRequest.jwtVerify()',
      );
      await request.jwtVerify();
    }

    const useCase = request.diScope.resolve<GetPartnerBootstrapUseCase>('getPartnerBootstrapUseCase');
    emitFlowDiagnostic(
      detailed,
      correlationId,
      'PartnerBootstrapController.get()',
      'GetPartnerBootstrapUseCase.execute()',
    );
    const result = await useCase.execute({
      platform: headers['x-carbroz-platform'],
      appVersion: headers['x-carbroz-app-version'],
      authenticated: Boolean(request.user),
    });

    emitFlowDiagnostic(
      detailed,
      correlationId,
      'GetPartnerBootstrapUseCase.execute()',
      'ResponseHelper.success()',
    );
    return reply.status(200).send(
      ResponseHelper.success(result, 'Partner bootstrap completed', request.traceId),
    );
  };
}
