import type { FastifyReply, FastifyRequest } from 'fastify';
import type { GetInitConfigUseCase } from '@carbroz/domain-configuration';

/**
 * Compatibility HTTP adapter for the legacy /api/v1/app/init surface.
 * Configuration remains the single owner of bootstrap/runtime product decisions.
 */
export class AppController {
  constructor(private readonly getInitConfigUseCase: GetInitConfigUseCase) {}

  public init = async (request: FastifyRequest, reply: FastifyReply) => {
    const config = await this.getInitConfigUseCase.execute();
    const isLoggedIn = Boolean(request.user);
    const route = isLoggedIn ? config.startupRouting.authenticated : config.startupRouting.guest;

    return reply.status(200).send({
      status: 'success',
      data: {
        isLoggedIn,
        config: {
          maintenance: config.maintenance,
          forceUpdate: config.forceUpdate,
          featureFlags: config.featureFlags,
        },
        nextRoute: {
          type: 'navigation',
          payload: route,
        },
      },
    });
  };
}
