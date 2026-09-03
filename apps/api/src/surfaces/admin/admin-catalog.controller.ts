import { ResponseHelper } from '../../transport/response/ResponseHelper.js';
import { type FastifyReply, type FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  createCategorySchema,
  createServiceSchema,
  createAddonSchema,
  createPricingTierSchema,
  setVehicleMultiplierSchema,
} from './dto/admin-catalog.dto.js';
import { ManageCatalogUseCase, ManagePricingTierUseCase } from '@carbroz/domain-catalog-pricing';
import { type IRequestContext } from '@carbroz/foundation-kernel';

export class AdminCatalogController {
  constructor(
    private readonly manageCatalogUseCase: ManageCatalogUseCase,
    private readonly managePricingTierUseCase: ManagePricingTierUseCase,
  ) {}

  private getContext(req: FastifyRequest): IRequestContext {
    return { traceId: req.traceId, authenticatedUser: req.user as any } as IRequestContext;
  }

  async createCategory(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = createCategorySchema.parse(req.body);
      const result = await this.manageCatalogUseCase.execute({ context: this.getContext(req), data: { action: 'CREATE_CATEGORY', payload: parsed } });
      return reply.status(201).send(ResponseHelper.success(result));
    } catch (error: any) {
      if (error instanceof z.ZodError) return reply.status(400).send(ResponseHelper.error('Validation failed', (error as any).errors));
      req.log.error(error);
      return reply.status(error.message.startsWith('FORBIDDEN') ? 403 : 500).send(ResponseHelper.error(error.message));
    }
  }

  async createService(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = createServiceSchema.parse(req.body);
      const result = await this.manageCatalogUseCase.execute({ context: this.getContext(req), data: { action: 'CREATE_SERVICE', payload: parsed } });
      return reply.status(201).send(ResponseHelper.success(result));
    } catch (error: any) {
      if (error instanceof z.ZodError) return reply.status(400).send(ResponseHelper.error('Validation failed', (error as any).errors));
      req.log.error(error);
      return reply.status(error.message.startsWith('FORBIDDEN') ? 403 : 500).send(ResponseHelper.error(error.message));
    }
  }

  async createAddon(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = createAddonSchema.parse(req.body);
      const result = await this.manageCatalogUseCase.execute({ context: this.getContext(req), data: { action: 'CREATE_ADDON', payload: parsed } });
      return reply.status(201).send(ResponseHelper.success(result));
    } catch (error: any) {
      if (error instanceof z.ZodError) return reply.status(400).send(ResponseHelper.error('Validation failed', (error as any).errors));
      req.log.error(error);
      return reply.status(error.message.startsWith('FORBIDDEN') ? 403 : 500).send(ResponseHelper.error(error.message));
    }
  }

  async createPricingTier(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = createPricingTierSchema.parse(req.body);
      const result = await this.managePricingTierUseCase.execute({ context: this.getContext(req), data: { action: 'CREATE_TIER', serviceId: parsed.serviceId, payload: parsed } });
      return reply.status(201).send(ResponseHelper.success(result));
    } catch (error: any) {
      if (error instanceof z.ZodError) return reply.status(400).send(ResponseHelper.error('Validation failed', (error as any).errors));
      req.log.error(error);
      return reply.status(error.message.startsWith('FORBIDDEN') ? 403 : 500).send(ResponseHelper.error(error.message));
    }
  }

  async setVehicleMultiplier(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = setVehicleMultiplierSchema.parse(req.body);
      const result = await this.managePricingTierUseCase.execute({ context: this.getContext(req), data: { action: 'SET_VEHICLE_MULTIPLIER', serviceId: parsed.serviceId, payload: parsed } });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      if (error instanceof z.ZodError) return reply.status(400).send(ResponseHelper.error('Validation failed', (error as any).errors));
      req.log.error(error);
      return reply.status(error.message.startsWith('FORBIDDEN') ? 403 : 500).send(ResponseHelper.error(error.message));
    }
  }
}
