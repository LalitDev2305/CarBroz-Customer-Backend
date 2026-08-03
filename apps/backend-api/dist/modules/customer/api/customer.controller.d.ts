import { FastifyReply, FastifyRequest } from 'fastify';
import { GetCustomerProfileUseCase } from '../use-cases/GetCustomerProfileUseCase.js';
import { UpdateCustomerProfileUseCase } from '../use-cases/UpdateCustomerProfileUseCase.js';
import { ManageAddressUseCase } from '../use-cases/ManageAddressUseCase.js';
import { ExtractCustomerDataUseCase } from '../use-cases/ExtractCustomerDataUseCase.js';
export declare class CustomerController {
    private readonly getCustomerProfileUseCase;
    private readonly updateCustomerProfileUseCase;
    private readonly manageAddressUseCase;
    private readonly extractCustomerDataUseCase;
    constructor(getCustomerProfileUseCase: GetCustomerProfileUseCase, updateCustomerProfileUseCase: UpdateCustomerProfileUseCase, manageAddressUseCase: ManageAddressUseCase, extractCustomerDataUseCase: ExtractCustomerDataUseCase);
    private getContext;
    getProfile(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    updateProfile(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    getAddresses(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    addAddress(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    updateAddress(req: FastifyRequest<{
        Params: {
            addressId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    deleteAddress(req: FastifyRequest<{
        Params: {
            addressId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    extractData(req: FastifyRequest, reply: FastifyReply): Promise<never>;
}
