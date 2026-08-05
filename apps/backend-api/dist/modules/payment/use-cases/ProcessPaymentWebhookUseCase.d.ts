import { IBookingRepository, IPaymentGatewayProvider, IPaymentRepository, ITransactionProvider } from '@carbroz/common';
import { GenerateInvoiceUseCase } from '../../invoice/use-cases/GenerateInvoiceUseCase.js';
export interface ProcessWebhookInput {
    rawBodyBuffer: Buffer;
    signature: string;
    webhookSecret: string;
}
export declare class ProcessPaymentWebhookUseCase {
    private readonly paymentRepository;
    private readonly bookingRepository;
    private readonly paymentGatewayProvider;
    private readonly generateInvoiceUseCase;
    private readonly transactionProvider;
    constructor(paymentRepository: IPaymentRepository, bookingRepository: IBookingRepository, paymentGatewayProvider: IPaymentGatewayProvider, generateInvoiceUseCase: GenerateInvoiceUseCase, transactionProvider: ITransactionProvider);
    execute(input: ProcessWebhookInput): Promise<{
        processed: boolean;
        message: string;
    }>;
}
