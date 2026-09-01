import { IPaymentRepository, Payment } from '@carbroz/common';

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
