import { FastifyReply, FastifyRequest } from 'fastify';
import { GetCatalogUseCase } from '../use-cases/GetCatalogUseCase.js';
import { CalculateServicePriceUseCase } from '../use-cases/CalculateServicePriceUseCase.js';
export declare class CatalogController {
    private readonly getCatalogUseCase;
    private readonly calculateServicePriceUseCase;
    constructor(getCatalogUseCase: GetCatalogUseCase, calculateServicePriceUseCase: CalculateServicePriceUseCase);
    getCatalog(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    calculatePrice(req: FastifyRequest, reply: FastifyReply): Promise<never>;
}
