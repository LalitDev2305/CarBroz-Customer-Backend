import { toExecutionContext } from '../../../bootstrap/lifecycle/toExecutionContext.js';
import { ResponseHelper, type ApiErrorStatus } from '../../../transport/response/ResponseHelper.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { ExecutionContext } from '@carbroz/foundation-kernel';

import { updateProfileSchema, addAddressSchema, updateAddressSchema } from '../dto/customer.customer.dto.js';
import { GetCustomerProfileUseCase } from '@carbroz/domain-customer';
import { UpdateCustomerProfileUseCase } from '@carbroz/domain-customer';
import { ManageAddressUseCase } from '@carbroz/domain-customer';
import { ExtractCustomerDataUseCase } from '@carbroz/domain-customer';

/** Customer HTTP adapter. */
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

  private sendError(req: FastifyRequest, reply: FastifyReply, error: any, allowBadRequest = false, allowNotFound = false) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send(ResponseHelper.error(400, 'Validation failed', req.traceId));
    }
    req.log.error(error);
    const statusCode: ApiErrorStatus = error.message.startsWith('FORBIDDEN')
      ? 403
      : allowBadRequest && error.message.startsWith('BAD_REQUEST')
        ? 400
        : allowNotFound && error.message.startsWith('NOT_FOUND')
          ? 404
          : 500;
    const message = statusCode === 500 ? 'Something went wrong. Please try again later.' : error.message;
    return reply.status(statusCode).send(ResponseHelper.error(statusCode, message, req.traceId));
  }

  async getProfile(req: FastifyRequest, reply: FastifyReply) {
    try {
      const context = this.getContext(req);
      const result = await this.getCustomerProfileUseCase.execute({ context, data: { userId: (req.user as any).id } });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      return this.sendError(req, reply, error);
    }
  }

  async updateProfile(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsedBody = updateProfileSchema.parse(req.body);
      const context = this.getContext(req);
      const result = await this.updateCustomerProfileUseCase.execute({ context, data: { userId: (req.user as any).id, ...parsedBody } });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      return this.sendError(req, reply, error);
    }
  }

  async getAddresses(req: FastifyRequest, reply: FastifyReply) {
    try {
      const context = this.getContext(req);
      const result = await this.manageAddressUseCase.execute({ context, data: { userId: (req.user as any).id, action: 'GET_ALL' } });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      return this.sendError(req, reply, error);
    }
  }

  async addAddress(req: FastifyRequest, reply: FastifyReply) {
    try {
      const parsedBody = addAddressSchema.parse(req.body);
      const context = this.getContext(req);
      const result = await this.manageAddressUseCase.execute({ context, data: { userId: (req.user as any).id, action: 'ADD', payload: parsedBody } });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      return this.sendError(req, reply, error, true);
    }
  }

  async updateAddress(req: FastifyRequest<{ Params: { addressPublicId: string } }>, reply: FastifyReply) {
    try {
      const parsedBody = updateAddressSchema.parse(req.body);
      const context = this.getContext(req);
      const result = await this.manageAddressUseCase.execute({
        context,
        data: { userId: (req.user as any).id, action: 'UPDATE', addressPublicId: req.params.addressPublicId, payload: parsedBody },
      });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      return this.sendError(req, reply, error, true, true);
    }
  }

  async deleteAddress(req: FastifyRequest<{ Params: { addressPublicId: string } }>, reply: FastifyReply) {
    try {
      const context = this.getContext(req);
      await this.manageAddressUseCase.execute({
        context,
        data: { userId: (req.user as any).id, action: 'DELETE', addressPublicId: req.params.addressPublicId },
      });
      return reply.send(ResponseHelper.success(null, 'Address deleted'));
    } catch (error: any) {
      return this.sendError(req, reply, error, true, true);
    }
  }

  async extractData(req: FastifyRequest, reply: FastifyReply) {
    try {
      const context = this.getContext(req);
      const result = await this.extractCustomerDataUseCase.execute({ context, data: { userId: (req.user as any).id } });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      return this.sendError(req, reply, error);
    }
  }
}
