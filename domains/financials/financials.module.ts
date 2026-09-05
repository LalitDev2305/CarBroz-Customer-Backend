import { asClass, type AwilixContainer } from 'awilix';
import { TaxCalculator } from './domain/TaxCalculator.js';
import { registerPaymentModule } from './payment/payment.module.js';
import { registerInvoiceModule } from './invoice/invoice.module.js';
import { registerPayoutModule } from './payout/payout.module.js';

export function registerFinancialsModule(container: AwilixContainer): void {
  container.register({
    taxCalculator: asClass(TaxCalculator).singleton(),
  });
  registerPaymentModule(container);
  registerInvoiceModule(container);
  registerPayoutModule(container);
}
