import { ResponseHelper } from '../../transport/response/ResponseHelper.js';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { updateProfileSchema, addAddressSchema, updateAddressSchema } from './dto/customer.dto.js';
import { GetCustomerProfileUseCase } from '@carbroz/domain-customer';
import { UpdateCustomerProfileUseCase } from '@carbroz/domain-customer';
import { ManageAddressUseCase } from '@carbroz/domain-customer';
import { ExtractCustomerDataUseCase } from '@carbroz/domain-customer';
import { type IRequestContext } from '@carbroz/foundation-kernel';

export class CustomerController {
  constructor(
    private readonly getCustomerProfileUseCase: GetCustomerProfileUseCase,
    private readonly updateCustomerProfileUseCase: UpdateCustomerProfileUseCase,
    private readonly manageAddressUseCase: ManageAddressUseCase,
    private readonly extractCustomerDataUseCase: ExtractCustomerDataUseCase
  ) {}

  private getContext(req: FastifyRequest): IRequestContext {
    return {
      traceId: req.traceId,
      authenticatedUser: req.user as any
    } as IRequestContext;
  }

  async getProfile(req: FastifyRequest, reply: FastifyReply) {
    try {
      const context = this.getContext(req);
      const result = await this.getCustomerProfileUseCase.execute({
        context,
        data: { userId: (req.user as any).id }
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
          ...parsedBody
        }
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
        data: { userId: (req.user as any).id, action: 'GET_ALL' }
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
        data: { userId: (req.user as any).id, action: 'ADD', payload: parsedBody }
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
          payload: parsedBody 
        }
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
          addressId: parseInt(req.params.addressId, 10)
        }
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
        data: { userId: (req.user as any).id }
      });
      return reply.send(ResponseHelper.success(result));
    } catch (error: any) {
      req.log.error(error);
      const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
      return reply.status(statusCode).send(ResponseHelper.error(error.message));
    }
  }
}
