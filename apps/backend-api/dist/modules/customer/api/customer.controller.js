import { z } from 'zod';
import { updateProfileSchema, addAddressSchema, updateAddressSchema } from '../dtos/customer.dto.js';
import { ResponseHelper } from '@carbroz/common';
export class CustomerController {
    getCustomerProfileUseCase;
    updateCustomerProfileUseCase;
    manageAddressUseCase;
    extractCustomerDataUseCase;
    constructor(getCustomerProfileUseCase, updateCustomerProfileUseCase, manageAddressUseCase, extractCustomerDataUseCase) {
        this.getCustomerProfileUseCase = getCustomerProfileUseCase;
        this.updateCustomerProfileUseCase = updateCustomerProfileUseCase;
        this.manageAddressUseCase = manageAddressUseCase;
        this.extractCustomerDataUseCase = extractCustomerDataUseCase;
    }
    getContext(req) {
        return {
            traceId: req.traceId,
            authenticatedUser: req.user
        };
    }
    async getProfile(req, reply) {
        try {
            const context = this.getContext(req);
            const result = await this.getCustomerProfileUseCase.execute({
                context,
                data: { userId: req.user.id }
            });
            return reply.send(ResponseHelper.success(result));
        }
        catch (error) {
            req.log.error(error);
            const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
            return reply.status(statusCode).send(ResponseHelper.error(error.message));
        }
    }
    async updateProfile(req, reply) {
        try {
            const parsedBody = updateProfileSchema.parse(req.body);
            const context = this.getContext(req);
            const result = await this.updateCustomerProfileUseCase.execute({
                context,
                data: {
                    userId: req.user.id,
                    ...parsedBody
                }
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
    async getAddresses(req, reply) {
        try {
            const context = this.getContext(req);
            const result = await this.manageAddressUseCase.execute({
                context,
                data: { userId: req.user.id, action: 'GET_ALL' }
            });
            return reply.send(ResponseHelper.success(result));
        }
        catch (error) {
            req.log.error(error);
            const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
            return reply.status(statusCode).send(ResponseHelper.error(error.message));
        }
    }
    async addAddress(req, reply) {
        try {
            const parsedBody = addAddressSchema.parse(req.body);
            const context = this.getContext(req);
            const result = await this.manageAddressUseCase.execute({
                context,
                data: { userId: req.user.id, action: 'ADD', payload: parsedBody }
            });
            return reply.send(ResponseHelper.success(result));
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send(ResponseHelper.error('Validation failed', error.errors));
            }
            req.log.error(error);
            const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : error.message.startsWith('BAD_REQUEST') ? 400 : 500;
            return reply.status(statusCode).send(ResponseHelper.error(error.message));
        }
    }
    async updateAddress(req, reply) {
        try {
            const parsedBody = updateAddressSchema.parse(req.body);
            const context = this.getContext(req);
            const result = await this.manageAddressUseCase.execute({
                context,
                data: {
                    userId: req.user.id,
                    action: 'UPDATE',
                    addressId: parseInt(req.params.addressId, 10),
                    payload: parsedBody
                }
            });
            return reply.send(ResponseHelper.success(result));
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send(ResponseHelper.error('Validation failed', error.errors));
            }
            req.log.error(error);
            const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : error.message.startsWith('BAD_REQUEST') ? 400 : error.message.startsWith('NOT_FOUND') ? 404 : 500;
            return reply.status(statusCode).send(ResponseHelper.error(error.message));
        }
    }
    async deleteAddress(req, reply) {
        try {
            const context = this.getContext(req);
            await this.manageAddressUseCase.execute({
                context,
                data: {
                    userId: req.user.id,
                    action: 'DELETE',
                    addressId: parseInt(req.params.addressId, 10)
                }
            });
            return reply.send(ResponseHelper.success(null, 'Address deleted'));
        }
        catch (error) {
            req.log.error(error);
            const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : error.message.startsWith('BAD_REQUEST') ? 400 : error.message.startsWith('NOT_FOUND') ? 404 : 500;
            return reply.status(statusCode).send(ResponseHelper.error(error.message));
        }
    }
    async extractData(req, reply) {
        try {
            const context = this.getContext(req);
            const result = await this.extractCustomerDataUseCase.execute({
                context,
                data: { userId: req.user.id }
            });
            return reply.send(ResponseHelper.success(result));
        }
        catch (error) {
            req.log.error(error);
            const statusCode = error.message.startsWith('FORBIDDEN') ? 403 : 500;
            return reply.status(statusCode).send(ResponseHelper.error(error.message));
        }
    }
}
//# sourceMappingURL=customer.controller.js.map