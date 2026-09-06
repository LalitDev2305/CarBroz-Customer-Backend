import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  createCategorySchema,
  createServiceSchema,
  createAddonSchema,
  createPricingTierSchema,
  setVehicleMultiplierSchema
} from '../dto/admin-catalog.dto.js';
import { ManageCatalogUseCase } from '@carbroz/domain-catalog-pricing';
import { ManagePricingTierUseCase } from '@carbroz/domain-catalog-pricing';

import { toExecutionContext } from '../../../bootstrap/lifecycle/toExecutionContext.js';

/** AdminCatalogController is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export class AdminCatalogController {
  constructor(
    private readonly manageCatalogUseCase: ManageCatalogUseCase,
    private readonly managePricingTierUseCase: ManagePricingTierUseCase
  ) {}

  async createCategory(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = createCategorySchema.parse(req.body);
      const result = await this.manageCatalogUseCase.execute({
        context: toExecutionContext(req),
        data: { action: 'CREATE_CATEGORY', payload: parsed }
      });
      return reply.status(201).send(ResponseHelper.success(result));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send(ResponseHelper.error('Validation failed', (error as any).errors));
      }
      req.log.error(error);
      const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
      return reply.status(statusCode).send(ResponseHelper.error(error.message));
    }
  }

  async createService(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = createServiceSchema.parse(req.body);
      const result = await this.manageCatalogUseCase.execute({
        context: toExecutionContext(req),
        data: { action: 'CREATE_SERVICE', payload: parsed }
      });
      return reply.status(201).send(ResponseHelper.success(result));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send(ResponseHelper.error('Validation failed', (error as any).errors));
      }
      req.log.error(error);
      const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
      return reply.status(statusCode).send(ResponseHelper.error(error.message));
    }
  }

  async createAddon(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = createAddonSchema.parse(req.body);
      const result = await this.manageCatalogUseCase.execute({
        context: toExecutionContext(req),
        data: { action: 'CREATE_ADDON', payload: parsed }
      });
      return reply.status(201).send(ResponseHelper.success(result));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send(ResponseHelper.error('Validation failed', (error as any).errors));
      }
      req.log.error(error);
      const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
      return reply.status(statusCode).send(ResponseHelper.error(error.message));
    }
  }

  async createPricingTier(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = createPricingTierSchema.parse(req.body);
      const result = await this.managePricingTierUseCase.execute({
        context: toExecutionContext(req),
        data: { action: 'CREATE_TIER', serviceId: parsed.serviceId, payload: parsed }
      });
      return reply.status(201).send(ResponseHelper.success(result));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send(ResponseHelper.error('Validation failed', (error as any).errors));
      }
      req.log.error(error);
      const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
      return reply.status(statusCode).send(ResponseHelper.error(error.message));
    }
  }

  async setVehicleMultiplier(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = setVehicleMultiplierSchema.parse(req.body);
      const result = await this.managePricingTierUseCase.execute({
        context: toExecutionContext(req),
        data: { action: 'SET_VEHICLE_MULTIPLIER', serviceId: parsed.serviceId, payload: parsed }
      });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send(ResponseHelper.error('Validation failed', (error as any).errors));
      }
      req.log.error(error);
      const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
      return reply.status(statusCode).send(ResponseHelper.error(error.message));
    }
  }
}
