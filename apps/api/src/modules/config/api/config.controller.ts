import type { FastifyReply, FastifyRequest } from 'fastify';
import type { GetInitConfigUseCase } from '@carbroz/domain-configuration';

/** Thin HTTP adapter for the Configuration-owned startup contract. */
export class ConfigController {
  constructor(private readonly getInitConfigUseCase: GetInitConfigUseCase) {}

  async getInitConfig(_request: FastifyRequest, reply: FastifyReply) {
    const config = await this.getInitConfigUseCase.execute();
    return reply.status(200).send({
      success: true,
      data: config,
    });
  }
}
