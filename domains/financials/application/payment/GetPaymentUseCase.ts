import { type IPaymentRepository } from '../../payment/domain/repositories/IPaymentRepository.js';
import { Payment } from '../../payment/domain/Payment.js';

export class GetPaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(publicId: string, customerId: number): Promise<Payment> {
    const payment = await this.paymentRepository.findByPublicId(publicId);
    if (!payment || payment.customerId !== customerId) {
      throw new Error('Payment record not found or unauthorized');
    }
    return payment;
  }
}
