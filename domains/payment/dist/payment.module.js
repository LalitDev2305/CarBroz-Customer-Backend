import { asClass } from 'awilix';
import { PrismaPaymentRepository } from './infrastructure/repositories/PrismaPaymentRepository.js';
export function registerPaymentModule(container) {
    container.register({
        paymentRepository: asClass(PrismaPaymentRepository).singleton(),
    });
}
//# sourceMappingURL=payment.module.js.map