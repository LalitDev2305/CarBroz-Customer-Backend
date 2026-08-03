import { z } from 'zod';
import { calculatePriceSchema } from '../dtos/catalog.dto.js';
import { ResponseHelper } from '@carbroz/common';
export class CatalogController {
    getCatalogUseCase;
    calculateServicePriceUseCase;
    constructor(getCatalogUseCase, calculateServicePriceUseCase) {
        this.getCatalogUseCase = getCatalogUseCase;
        this.calculateServicePriceUseCase = calculateServicePriceUseCase;
    }
    async getCatalog(req, reply) {
        try {
            const catalog = await this.getCatalogUseCase.execute();
            return reply.send(ResponseHelper.success(catalog));
        }
        catch (error) {
            req.log.error(error);
            return reply.status(500).send(ResponseHelper.error(error.message));
        }
    }
    async calculatePrice(req, reply) {
        try {
            const parsed = calculatePriceSchema.parse(req.body);
            const result = await this.calculateServicePriceUseCase.execute({
                data: parsed
            });
            return reply.send(ResponseHelper.success(result));
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send(ResponseHelper.error('Validation failed', error.errors));
            }
            req.log.error(error);
            const statusCode = error.message.startsWith('NOT_FOUND') ? 404 : 500;
            return reply.status(statusCode).send(ResponseHelper.error(error.message));
        }
    }
}
//# sourceMappingURL=catalog.controller.js.map