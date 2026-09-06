import { toExecutionContext } from '../../../bootstrap/lifecycle/toExecutionContext.js';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { ActorContext, ExecutionContext } from '@carbroz/foundation-kernel';

import { updateProfileSchema, addAddressSchema, updateAddressSchema } from '../dto/customer.customer.dto.js';
import { GetCustomerProfileUseCase } from '@carbroz/domain-customer';
import { UpdateCustomerProfileUseCase } from '@carbroz/domain-customer';
import { ManageAddressUseCase } from '@carbroz/domain-customer';
import { ExtractCustomerDataUseCase } from '@carbroz/domain-customer';

type AuthenticatedRequestUser = {
  id?: string | number;
  customerId?: number;
  partnerId?: number;
  tenantId?: string;
  role?: string;
  roles?: string[];
  isAdmin?: boolean;
};

/**
 * Customer HTTP adapter.
 *
 * This controller owns parsing, HTTP status mapping and conversion from Fastify authentication
 * state into the transport-neutral Foundation ExecutionContext. Customer application services
 * never receive FastifyRequest, headers, JWT payloads or framework-specific user objects.
 */
export class CustomerController {
  constructor(
    private readonly getCustomerProfileUseCase: GetCustomerProfileUseCase,
    private readonly updateCustomerProfileUseCase: UpdateCustomerProfileUseCase,
    private readonly manageAddressUseCase: ManageAddressUseCase,
    private readonly extractCustomerDataUseCase: ExtractCustomerDataUseCase,
  ) {}

  private getContext(req: FastifyRequest): ExecutionContext {
    return toExecutionContext(req);
  }

  async getProfile(req: FastifyRequest, reply: FastifyReply) {
    try {
      const context = this.getContext(req);
      const result = await this.getCustomerProfileUseCase.execute({
        context,
        data: { userId: (req.user as any).id },
      });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      req.log.error(error);
      const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
      return reply.status(statusCode).send(ResponseHelper.error(error.message));
    }
  }

  async updateProfile(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsedBody = updateProfileSchema.parse(req.body);
      const context = this.getContext(req);
      const result = await this.updateCustomerProfileUseCase.execute({
        context,
        data: {
          userId: (req.user as any).id,
          ...parsedBody,
        },
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

  async getAddresses(req: FastifyRequest, reply: FastifyReply) {
    try {
      const context = this.getContext(req);
      const result = await this.manageAddressUseCase.execute({
        context,
        data: { userId: (req.user as any).id, action: 'GET_ALL' },
      });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      req.log.error(error);
      const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
      return reply.status(statusCode).send(ResponseHelper.error(error.message));
    }
  }

  async addAddress(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsedBody = addAddressSchema.parse(req.body);
      const context = this.getContext(req);
      const result = await this.manageAddressUseCase.execute({
        context,
        data: { userId: (req.user as any).id, action: 'ADD', payload: parsedBody },
      });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send(ResponseHelper.error('Validation failed', (error as any).errors));
      }
      req.log.error(error);
      const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : error.message.startsWith('BAD_REQUEST') ? 400 : 500;
      return reply.status(statusCode).send(ResponseHelper.error(error.message));
    }
  }

  async updateAddress(req: FastifyRequest<{ Params: { addressId: string } }>, reply: FastifyReply) {
    try {
      const parsedBody = updateAddressSchema.parse(req.body);
      const context = this.getContext(req);
      const result = await this.manageAddressUseCase.execute({
        context,
        data: {
          userId: (req.user as any).id,
          action: 'UPDATE',
          addressId: parseInt(req.params.addressId, 10),
          payload: parsedBody,
        },
      });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send(ResponseHelper.error('Validation failed', (error as any).errors));
      }
      req.log.error(error);
      const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : error.message.startsWith('BAD_REQUEST') ? 400 : error.message.startsWith('NOT_FOUND') ? 404 : 500;
      return reply.status(statusCode).send(ResponseHelper.error(error.message));
    }
  }

  async deleteAddress(req: FastifyRequest<{ Params: { addressId: string } }>, reply: FastifyReply) {
    try {
      const context = this.getContext(req);
      await this.manageAddressUseCase.execute({
        context,
        data: {
          userId: (req.user as any).id,
          action: 'DELETE',
          addressId: parseInt(req.params.addressId, 10),
        },
      });
      return reply.send(ResponseHelper.success(null, 'Address deleted'));
    } catch (error: any) {
      req.log.error(error);
      const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : error.message.startsWith('BAD_REQUEST') ? 400 : error.message.startsWith('NOT_FOUND') ? 404 : 500;
      return reply.status(statusCode).send(ResponseHelper.error(error.message));
    }
  }

  async extractData(req: FastifyRequest, reply: FastifyReply) {
    try {
      const context = this.getContext(req);
      const result = await this.extractCustomerDataUseCase.execute({
        context,
        data: { userId: (req.user as any).id },
      });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      req.log.error(error);
      const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
      return reply.status(statusCode).send(ResponseHelper.error(error.message));
    }
  }
}
