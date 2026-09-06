import { ResponseHelper } from '../response/ResponseHelper.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { GetSduiScreenUseCase } from '@carbroz/sdui-registry';
import { getSduiScreenSchema } from './dto/sdui-registry.dto.js';

/** SduiRegistryController is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
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
