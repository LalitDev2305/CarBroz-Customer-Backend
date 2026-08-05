export class AdminCorporateController {
    async listAccounts(request, reply) {
        try {
            const { status } = request.query;
            const corporateAccountRepo = request.diScope.resolve('corporateAccountRepo');
            const accounts = await corporateAccountRepo.listByStatus(status);
            return reply.send({ success: true, data: accounts });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
    async approveAccount(request, reply) {
        try {
            const user = request.user;
            const approveAccountUseCase = request.diScope.resolve('approveAccountUseCase');
            const { accountPublicId } = request.params;
            const { initialCreditLimitPaise } = request.body;
            const result = await approveAccountUseCase.execute({ accountPublicId, initialCreditLimitPaise }, user.id);
            return reply.send({ success: true, data: result });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
    async adjustCreditLimit(request, reply) {
        try {
            const user = request.user;
            const adjustCreditLimitUseCase = request.diScope.resolve('adjustCreditLimitUseCase');
            const { accountPublicId } = request.params;
            const { newCreditLimitPaise, reason } = request.body;
            const result = await adjustCreditLimitUseCase.execute({ accountPublicId, newCreditLimitPaise, reason }, user.id);
            return reply.send({ success: true, data: result });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
    async generateInvoice(request, reply) {
        try {
            const user = request.user;
            const generateCorporateInvoiceUseCase = request.diScope.resolve('generateCorporateInvoiceUseCase');
            const { accountPublicId } = request.params;
            const dto = { ...request.body, accountPublicId };
            const result = await generateCorporateInvoiceUseCase.execute(dto, user.id);
            return reply.status(201).send({ success: true, data: result });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
    async reconcilePayment(request, reply) {
        try {
            const user = request.user;
            const reconcilePaymentUseCase = request.diScope.resolve('reconcilePaymentUseCase');
            const { invoicePublicId } = request.params;
            const { paymentAmountPaise, referenceNotes } = request.body;
            const result = await reconcilePaymentUseCase.execute({ invoicePublicId, paymentAmountPaise, referenceNotes }, user.id);
            return reply.send({ success: true, data: result });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
}
//# sourceMappingURL=AdminCorporateController.js.map