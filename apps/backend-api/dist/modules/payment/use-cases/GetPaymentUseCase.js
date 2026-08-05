export class GetPaymentUseCase {
    paymentRepository;
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
    async execute(publicId, customerId) {
        const payment = await this.paymentRepository.findByPublicId(publicId);
        if (!payment || payment.customerId !== customerId) {
            throw new Error('Payment record not found or unauthorized');
        }
        return payment;
    }
}
//# sourceMappingURL=GetPaymentUseCase.js.map