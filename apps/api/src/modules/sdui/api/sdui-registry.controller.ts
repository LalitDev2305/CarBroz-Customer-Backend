import { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseHelper } from '@carbroz/common';
import { GetSduiScreenUseCase } from '../use-cases/GetSduiScreenUseCase.js';
import { getSduiScreenSchema } from '../dtos/sdui-registry.dto.js';

export class SduiRegistryController {
  constructor(private readonly getSduiScreenUseCase: GetSduiScreenUseCase) {}

  public getScreen = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { screenId: string };
    const query = request.query as { targetApp?: unknown };

    const dto = getSduiScreenSchema.parse({
      screenId: params.screenId,
      targetApp: query.targetApp || 'CUSTOMER',
    });

    const screenLayout = await this.getSduiScreenUseCase.execute({ data: dto });
    return reply.send(ResponseHelper.success(screenLayout));
  };
}
