import { IPaymentRepository, Payment } from '@carbroz/foundation-kernel';
export declare class GetPaymentUseCase {
    private readonly paymentRepository;
    constructor(paymentRepository: IPaymentRepository);
    execute(publicId: string, customerId: number): Promise<Payment>;
}
