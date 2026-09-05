import type { AwilixContainer } from 'awilix';
import { registerPaymentModule } from './payment/payment.module.js';
import { registerInvoiceModule } from './invoice/invoice.module.js';
import { registerPayoutModule } from './payout/payout.module.js';

export function registerFinancialsModule(container: AwilixContainer): void {
  registerPaymentModule(container);
  registerInvoiceModule(container);
  registerPayoutModule(container);
}
