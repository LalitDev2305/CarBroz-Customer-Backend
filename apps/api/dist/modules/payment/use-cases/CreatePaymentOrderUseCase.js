import crypto from 'node:crypto';
import { Payment, } from '@carbroz/foundation-kernel';
export class CreatePaymentOrderUseCase {
    paymentRepository;
    bookingRepository;
    paymentGatewayProvider;
    constructor(paymentRepository, bookingRepository, paymentGatewayProvider) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.paymentGatewayProvider = paymentGatewayProvider;
    }
    async execute(input) {
        const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
        if (!booking || booking.customerId !== input.customerId) {
            throw new Error('Booking not found or unauthorized');
        }
        if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED' || booking.status === 'COMPLETED') {
            throw new Error(`Cannot create payment for booking in status ${booking.status}`);
        }
        if (booking.expiryAt && new Date() > booking.expiryAt) {
            throw new Error('Booking slot hold has expired');
        }
        const existingPayment = await this.paymentRepository.findByBookingId(booking.id);
        if (existingPayment && existingPayment.status === 'SUCCESS') {
            throw new Error('Booking has already been successfully paid');
        }
        const idempotencyKey = crypto.createHash('sha256').update(`bk_${booking.id}_${booking.totalPricePaise}`).digest('hex');
        if (existingPayment && existingPayment.status === 'PENDING') {
            return {
                payment: existingPayment,
                checkoutParams: {
                    orderId: existingPayment.providerOrderId,
                    amountPaise: existingPayment.amountPaise,
                    currency: existingPayment.currency,
                },
            };
        }
        const orderResult = await this.paymentGatewayProvider.createOrder({
            bookingPublicId: booking.publicId,
            amountPaise: booking.totalPricePaise,
            currency: 'INR',
            idempotencyKey,
        });
        const payment = new Payment({
            bookingId: booking.id,
            customerId: input.customerId,
            provider: 'RAZORPAY',
            providerOrderId: orderResult.providerOrderId,
            amountPaise: booking.totalPricePaise,
            currency: 'INR',
            status: 'PENDING',
            idempotencyKey,
        });
        const createdPayment = await this.paymentRepository.create(payment);
        return {
            payment: createdPayment,
            checkoutParams: {
                orderId: orderResult.providerOrderId,
                amountPaise: orderResult.amountPaise,
                currency: orderResult.currency,
                keyId: orderResult.keyId,
            },
        };
    }
}
//# sourceMappingURL=CreatePaymentOrderUseCase.js.map