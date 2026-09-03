import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const patch = (relative, transform) => {
  const file = p(relative);
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after !== before) fs.writeFileSync(file, after);
};

// Foundation owns the universal Money value object. Keep the generic minor-unit
// API while preserving the established INR/paise vocabulary used by Financials.
patch('foundation/kernel/src/domain/Money.ts', (text) => {
  if (!text.includes('static fromPaise(')) {
    text = text.replace(
      '  static fromMinor(amountMinor: number, currency = \'INR\'): Money {\n    return new Money(amountMinor, currency);\n  }',
      `  static fromMinor(amountMinor: number, currency = 'INR'): Money {\n    return new Money(amountMinor, currency);\n  }\n\n  static fromPaise(amountPaise: number, currency = 'INR'): Money {\n    return new Money(amountPaise, currency);\n  }`,
    );
  }
  if (!text.includes('get amountPaise(): number')) {
    text = text.replace(
      '  get amountMinor(): number {\n    return this._amountMinor;\n  }',
      `  get amountMinor(): number {\n    return this._amountMinor;\n  }\n\n  get amountPaise(): number {\n    return this._amountMinor;\n  }`,
    );
  }
  return text;
});

// Financials must consume the one Foundation Money owner, never a removed
// shared-kernel alias.
patch('domains/financials/payment/domain/Payment.ts', (text) =>
  text
    .replace(/from ['"]@carbroz\/shared-kernel['"]/g, "from '@carbroz/foundation-kernel'")
    .replace(/this\.currency\s*=\s*validatedMoney\.currency;/g, 'this.currency = validatedMoney.currency;')
);

// Public barrels may expose both the application input and a historical
// capability input with the same name. Export the application class explicitly
// so there is one public CreatePaymentOrderInput contract.
patch('domains/financials/public/index.ts', (text) =>
  text.replace(
    /export \* from ['"]\.\.\/application\/payment\/CreatePaymentOrderUseCase\.js['"];/g,
    "export { CreatePaymentOrderUseCase } from '../application/payment/CreatePaymentOrderUseCase.js';",
  )
);

console.log('Backend V3 Financials bounded context finalized.');
