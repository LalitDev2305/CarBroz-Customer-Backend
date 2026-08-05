import { IBookingRepository, IPaymentGatewayProvider, IPaymentRepository, Payment } from '@carbroz/common';
export interface CreatePaymentOrderInput {
    bookingPublicId: string;
    customerId: number;
}
export declare class CreatePaymentOrderUseCase {
    private readonly paymentRepository;
    private readonly bookingRepository;
    private readonly paymentGatewayProvider;
    constructor(paymentRepository: IPaymentRepository, bookingRepository: IBookingRepository, paymentGatewayProvider: IPaymentGatewayProvider);
    execute(input: CreatePaymentOrderInput): Promise<{
        payment: Payment;
        checkoutParams: any;
    }>;
}
