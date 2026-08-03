import { z } from 'zod';
import { createCategorySchema, createServiceSchema, createAddonSchema, createPricingTierSchema, setVehicleMultiplierSchema } from '../../catalog/dtos/catalog.dto.js';
import { ResponseHelper } from '@carbroz/common';
export class AdminCatalogController {
    manageCatalogUseCase;
    managePricingTierUseCase;
    constructor(manageCatalogUseCase, managePricingTierUseCase) {
        this.manageCatalogUseCase = manageCatalogUseCase;
        this.managePricingTierUseCase = managePricingTierUseCase;
    }
    getContext(req) {
        return {
            traceId: req.traceId,
            authenticatedUser: req.user
        };
    }
    async createCategory(req, reply) {
        try {
            const parsed = createCategorySchema.parse(req.body);
            const result = await this.manageCatalogUseCase.execute({
                context: this.getContext(req),
                data: { action: 'CREATE_CATEGORY', payload: parsed }
            });
            return reply.status(201).send(ResponseHelper.success(result));
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send(ResponseHelper.error('Validation failed', error.errors));
            }
            req.log.error(error);
            const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
            return reply.status(statusCode).send(ResponseHelper.error(error.message));
        }
    }
    async createService(req, reply) {
        try {
            const parsed = createServiceSchema.parse(req.body);
            const result = await this.manageCatalogUseCase.execute({
                context: this.getContext(req),
                data: { action: 'CREATE_SERVICE', payload: parsed }
            });
            return reply.status(201).send(ResponseHelper.success(result));
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send(ResponseHelper.error('Validation failed', error.errors));
            }
            req.log.error(error);
            const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
            return reply.status(statusCode).send(ResponseHelper.error(error.message));
        }
    }
    async createAddon(req, reply) {
        try {
            const parsed = createAddonSchema.parse(req.body);
            const result = await this.manageCatalogUseCase.execute({
                context: this.getContext(req),
                data: { action: 'CREATE_ADDON', payload: parsed }
            });
            return reply.status(201).send(ResponseHelper.success(result));
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send(ResponseHelper.error('Validation failed', error.errors));
            }
            req.log.error(error);
            const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
            return reply.status(statusCode).send(ResponseHelper.error(error.message));
        }
    }
    async createPricingTier(req, reply) {
        try {
            const parsed = createPricingTierSchema.parse(req.body);
            const result = await this.managePricingTierUseCase.execute({
                context: this.getContext(req),
                data: { action: 'CREATE_TIER', serviceId: parsed.serviceId, payload: parsed }
            });
            return reply.status(201).send(ResponseHelper.success(result));
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send(ResponseHelper.error('Validation failed', error.errors));
            }
            req.log.error(error);
            const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
            return reply.status(statusCode).send(ResponseHelper.error(error.message));
        }
    }
    async setVehicleMultiplier(req, reply) {
        try {
            const parsed = setVehicleMultiplierSchema.parse(req.body);
            const result = await this.managePricingTierUseCase.execute({
                context: this.getContext(req),
                data: { action: 'SET_VEHICLE_MULTIPLIER', serviceId: parsed.serviceId, payload: parsed }
            });
            return reply.send(ResponseHelper.success(result));
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send(ResponseHelper.error('Validation failed', error.errors));
            }
            req.log.error(error);
            const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
            return reply.status(statusCode).send(ResponseHelper.error(error.message));
        }
    }
}
//# sourceMappingURL=admin-catalog.controller.js.map