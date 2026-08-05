import { FastifyRequest, FastifyReply } from 'fastify';
export declare class AdminCorporateController {
    listAccounts(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    approveAccount(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    adjustCreditLimit(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    generateInvoice(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    reconcilePayment(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
