import { FastifyReply, FastifyRequest } from 'fastify';
import { CreatePaymentOrderUseCase } from '../use-cases/CreatePaymentOrderUseCase.js';
import { GetPaymentUseCase } from '../use-cases/GetPaymentUseCase.js';
import { ProcessPaymentWebhookUseCase } from '../use-cases/ProcessPaymentWebhookUseCase.js';
import { GetInvoiceUseCase } from '../../invoice/use-cases/GetInvoiceUseCase.js';
export declare class PaymentController {
    private readonly createPaymentOrderUseCase;
    private readonly getPaymentUseCase;
    private readonly processPaymentWebhookUseCase;
    private readonly getInvoiceUseCase;
    constructor(createPaymentOrderUseCase: CreatePaymentOrderUseCase, getPaymentUseCase: GetPaymentUseCase, processPaymentWebhookUseCase: ProcessPaymentWebhookUseCase, getInvoiceUseCase: GetInvoiceUseCase);
    createCheckout(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    getPayment(request: FastifyRequest<{
        Params: {
            publicId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    getInvoice(request: FastifyRequest<{
        Params: {
            publicId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    handleWebhook(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
