import { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseHelper } from '@carbroz/common';
import { RegisterSduiComponentUseCase } from '../../sdui/use-cases/RegisterSduiComponentUseCase.js';
import { UpdateSduiScreenLayoutUseCase } from '../../sdui/use-cases/UpdateSduiScreenLayoutUseCase.js';
import { registerSduiComponentSchema, updateSduiScreenSchema } from '../../sdui/dtos/sdui-registry.dto.js';

export class AdminSduiController {
  constructor(
    private readonly registerSduiComponentUseCase: RegisterSduiComponentUseCase,
    private readonly updateSduiScreenLayoutUseCase: UpdateSduiScreenLayoutUseCase
  ) {}

  public registerComponent = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = registerSduiComponentSchema.parse(request.body);
    const result = await this.registerSduiComponentUseCase.execute({
      context: (request as any).requestContext,
      data: dto
    });
    return reply.status(201).send(ResponseHelper.success(result, 'Component registered successfully'));
  };

  public updateScreenLayout = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = updateSduiScreenSchema.parse(request.body);
    const result = await this.updateSduiScreenLayoutUseCase.execute({
      context: (request as any).requestContext,
      data: dto
    });
    return reply.send(ResponseHelper.success(result, 'Screen layout published successfully'));
  };
}
