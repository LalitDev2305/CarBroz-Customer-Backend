import { asClass } from 'awilix';
import { PrismaInvoiceRepository } from './infrastructure/repositories/PrismaInvoiceRepository.js';
export function registerInvoiceModule(container) {
    container.register({
        invoiceRepository: asClass(PrismaInvoiceRepository).singleton(),
    });
}
//# sourceMappingURL=invoice.module.js.map