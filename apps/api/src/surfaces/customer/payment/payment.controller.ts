import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { CreatePaymentOrderUseCase } from '@carbroz/domain-financials';
import { GetPaymentUseCase } from '@carbroz/domain-financials';
import { ProcessPaymentWebhookUseCase } from '@carbroz/domain-financials';
import { GetInvoiceUseCase } from '@carbroz/domain-financials';
import { createCheckoutSchema } from './dto/payment.dto.js';

export class PaymentController {
  constructor(
    private readonly createPaymentOrderUseCase: CreatePaymentOrderUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase,
    private readonly processPaymentWebhookUseCase: ProcessPaymentWebhookUseCase,
    private readonly getInvoiceUseCase: GetInvoiceUseCase
  ) {}

  async createCheckout(request: FastifyRequest, reply: FastifyReply) {
    const customerId = (request as any).user?.customerId || (request as any).user?.id || 1;
    const body = createCheckoutSchema.parse(request.body);

    const result = await this.createPaymentOrderUseCase.execute({
      bookingPublicId: body.bookingPublicId,
      customerId,
    });

    return reply.status(201).send(ResponseHelper.created(result, 'Payment checkout order created'));
  }

  async getPayment(request: FastifyRequest<{ Params: { publicId: string } }>, reply: FastifyReply) {
    const customerId = (request as any).user?.customerId || (request as any).user?.id || 1;
    const payment = await this.getPaymentUseCase.execute(request.params.publicId, customerId);
    return reply.send(ResponseHelper.success(payment));
  }

  async getInvoice(request: FastifyRequest<{ Params: { publicId: string } }>, reply: FastifyReply) {
    const invoice = await this.getInvoiceUseCase.execute(request.params.publicId);
    return reply.send(ResponseHelper.success(invoice));
  }

  async handleWebhook(request: FastifyRequest, reply: FastifyReply) {
    const signature = (request.headers['x-razorpay-signature'] as string) || '';
    const rawBodyBuffer = (request as any).rawBodyBuffer || Buffer.from(JSON.stringify(request.body || {}));
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_secret';

    const result = await this.processPaymentWebhookUseCase.execute({
      rawBodyBuffer,
      signature,
      webhookSecret,
    });

    return reply.status(200).send(ResponseHelper.success(result, result.message));
  }
}
