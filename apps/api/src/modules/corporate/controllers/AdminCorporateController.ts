import { FastifyRequest, FastifyReply } from 'fastify';
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
      const corporateAccountRepo = (request as any).diScope.resolve('corporateAccountRepo');
      const accounts = await corporateAccountRepo.listByStatus(status);
      return reply.send({ success: true, data: accounts });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }

  async approveAccount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const approveAccountUseCase = (request as any).diScope.resolve('approveAccountUseCase') as ApproveCorporateAccountUseCase;
      const { accountPublicId } = request.params as any;
      const { initialCreditLimitPaise } = request.body as any;
      const result = await approveAccountUseCase.execute(
        { accountPublicId, initialCreditLimitPaise },
        user.id
      );
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }

  async adjustCreditLimit(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const adjustCreditLimitUseCase = (request as any).diScope.resolve('adjustCreditLimitUseCase') as AdjustCreditLimitUseCase;
      const { accountPublicId } = request.params as any;
      const { newCreditLimitPaise, reason } = request.body as any;
      const result = await adjustCreditLimitUseCase.execute(
        { accountPublicId, newCreditLimitPaise, reason },
        user.id
      );
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }

  async generateInvoice(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const generateCorporateInvoiceUseCase = (request as any).diScope.resolve('generateCorporateInvoiceUseCase') as GenerateCorporateInvoiceUseCase;
      const { accountPublicId } = request.params as any;
      const dto = { ...(request.body as any), accountPublicId };
      const result = await generateCorporateInvoiceUseCase.execute(dto, user.id);
      return reply.status(201).send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }

  async reconcilePayment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const reconcilePaymentUseCase = (request as any).diScope.resolve('reconcilePaymentUseCase') as ReconcileCorporatePaymentUseCase;
      const { invoicePublicId } = request.params as any;
      const { paymentAmountPaise, referenceNotes } = request.body as any;
      const result = await reconcilePaymentUseCase.execute(
        { invoicePublicId, paymentAmountPaise, referenceNotes },
        user.id
      );
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }
}
