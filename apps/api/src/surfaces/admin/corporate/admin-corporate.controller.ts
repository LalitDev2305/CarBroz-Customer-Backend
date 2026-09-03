import { type FastifyReply, type FastifyRequest } from 'fastify';
import {
  AdjustCreditLimitUseCase,
  ApproveCorporateAccountUseCase,
  GenerateCorporateInvoiceUseCase,
  ReconcileCorporatePaymentUseCase,
} from '@carbroz/domain-enterprise';

export class AdminCorporateController {
  async listAccounts(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { status } = request.query as any;
      const repository = (request as any).diScope.resolve('corporateAccountRepo');
      const accounts = await repository.listByStatus(status);
      return reply.send({ success: true, data: accounts });
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: { message: error.message } });
    }
  }

  async approveAccount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const useCase = (request as any).diScope.resolve('approveAccountUseCase') as ApproveCorporateAccountUseCase;
      const { accountPublicId } = request.params as any;
      const { initialCreditLimitPaise } = request.body as any;
      const result = await useCase.execute({ accountPublicId, initialCreditLimitPaise }, user.id);
      return reply.send({ success: true, data: result });
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: { message: error.message } });
    }
  }

  async adjustCreditLimit(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const useCase = (request as any).diScope.resolve('adjustCreditLimitUseCase') as AdjustCreditLimitUseCase;
      const { accountPublicId } = request.params as any;
      const { newCreditLimitPaise, reason } = request.body as any;
      const result = await useCase.execute({ accountPublicId, newCreditLimitPaise, reason }, user.id);
      return reply.send({ success: true, data: result });
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: { message: error.message } });
    }
  }

  async generateInvoice(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const useCase = (request as any).diScope.resolve('generateCorporateInvoiceUseCase') as GenerateCorporateInvoiceUseCase;
      const { accountPublicId } = request.params as any;
      const result = await useCase.execute({ ...(request.body as any), accountPublicId }, user.id);
      return reply.status(201).send({ success: true, data: result });
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: { message: error.message } });
    }
  }

  async reconcilePayment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const useCase = (request as any).diScope.resolve('reconcilePaymentUseCase') as ReconcileCorporatePaymentUseCase;
      const { invoicePublicId } = request.params as any;
      const { paymentAmountPaise, referenceNotes } = request.body as any;
      const result = await useCase.execute({ invoicePublicId, paymentAmountPaise, referenceNotes }, user.id);
      return reply.send({ success: true, data: result });
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: { message: error.message } });
    }
  }
}
