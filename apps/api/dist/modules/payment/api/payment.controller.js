import { ResponseHelper } from '@carbroz/foundation-kernel';
import { createCheckoutSchema } from '../dtos/payment.dto.js';
export class PaymentController {
    createPaymentOrderUseCase;
    getPaymentUseCase;
    processPaymentWebhookUseCase;
    getInvoiceUseCase;
    constructor(createPaymentOrderUseCase, getPaymentUseCase, processPaymentWebhookUseCase, getInvoiceUseCase) {
        this.createPaymentOrderUseCase = createPaymentOrderUseCase;
        this.getPaymentUseCase = getPaymentUseCase;
        this.processPaymentWebhookUseCase = processPaymentWebhookUseCase;
        this.getInvoiceUseCase = getInvoiceUseCase;
    }
    async createCheckout(request, reply) {
        const customerId = request.user?.customerId || request.user?.id || 1;
        const body = createCheckoutSchema.parse(request.body);
        const result = await this.createPaymentOrderUseCase.execute({
            bookingPublicId: body.bookingPublicId,
            customerId,
        });
        return reply.status(201).send(ResponseHelper.created(result, 'Payment checkout order created'));
    }
    async getPayment(request, reply) {
        const customerId = request.user?.customerId || request.user?.id || 1;
        const payment = await this.getPaymentUseCase.execute(request.params.publicId, customerId);
        return reply.send(ResponseHelper.success(payment));
    }
    async getInvoice(request, reply) {
        const invoice = await this.getInvoiceUseCase.execute(request.params.publicId);
        return reply.send(ResponseHelper.success(invoice));
    }
    async handleWebhook(request, reply) {
        const signature = request.headers['x-razorpay-signature'] || '';
        const rawBodyBuffer = request.rawBodyBuffer || Buffer.from(JSON.stringify(request.body || {}));
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_secret';
        const result = await this.processPaymentWebhookUseCase.execute({
            rawBodyBuffer,
            signature,
            webhookSecret,
        });
        return reply.status(200).send(ResponseHelper.success(result, result.message));
    }
}
//# sourceMappingURL=payment.controller.js.map