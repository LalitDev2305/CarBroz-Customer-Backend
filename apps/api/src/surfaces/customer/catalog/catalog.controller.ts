import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { calculatePriceSchema } from './dto/catalog.dto.js';
import { GetCatalogUseCase } from '@carbroz/domain-catalog-pricing';
import { CalculateServicePriceUseCase } from '@carbroz/domain-catalog-pricing';


export class CatalogController {
  constructor(
    private readonly getCatalogUseCase: GetCatalogUseCase,
    private readonly calculateServicePriceUseCase: CalculateServicePriceUseCase
  ) {}

  async getCatalog(req: FastifyRequest, reply: FastifyReply) {
    try {
      const catalog = await this.getCatalogUseCase.execute();
      return reply.send(ResponseHelper.success(catalog));
    } catch (error: any) {
      req.log.error(error);
      return reply.status(500).send(ResponseHelper.error(error.message));
    }
  }

  async calculatePrice(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = calculatePriceSchema.parse(req.body);
      const result = await this.calculateServicePriceUseCase.execute({
        data: parsed
      });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send(ResponseHelper.error('Validation failed', (error as any).errors));
      }
      req.log.error(error);
      const statusCode = error.message.startsWith('NOT_FOUND') ? 404 : 500;
      return reply.status(statusCode).send(ResponseHelper.error(error.message));
    }
  }
}
