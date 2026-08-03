import { FastifyReply, FastifyRequest } from 'fastify';
import { ManageCatalogUseCase } from '../../catalog/use-cases/ManageCatalogUseCase.js';
import { ManagePricingTierUseCase } from '../../catalog/use-cases/ManagePricingTierUseCase.js';
export declare class AdminCatalogController {
    private readonly manageCatalogUseCase;
    private readonly managePricingTierUseCase;
    constructor(manageCatalogUseCase: ManageCatalogUseCase, managePricingTierUseCase: ManagePricingTierUseCase);
    private getContext;
    createCategory(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    createService(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    createAddon(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    createPricingTier(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    setVehicleMultiplier(req: FastifyRequest, reply: FastifyReply): Promise<never>;
}
