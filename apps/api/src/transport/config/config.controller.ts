import { FastifyReply, FastifyRequest } from 'fastify';
import { GetInitConfigUseCase } from '@carbroz/domain-configuration';

export class ConfigController {
  private getInitConfigUseCase: GetInitConfigUseCase;

  constructor(getInitConfigUseCase: GetInitConfigUseCase) {
    this.getInitConfigUseCase = getInitConfigUseCase;
  }

  async getInitConfig(request: FastifyRequest, reply: FastifyReply) {
    const config = await this.getInitConfigUseCase.execute();
    return reply.status(200).send({
      success: true,
      data: config,
    });
  }
}
