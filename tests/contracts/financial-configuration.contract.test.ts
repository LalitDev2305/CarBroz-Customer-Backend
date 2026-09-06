import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
const root = process.cwd();
describe('Financials configuration and composition contract', () => {
  it('preserves the frozen tax, commission, TDS and seller GSTIN defaults', () => {
    const source = fs.readFileSync(path.join(root, 'domains/financials/domain/FinancialConfiguration.ts'), 'utf8');
    for (const expected of ['cgstRatePercent: 9','sgstRatePercent: 9','igstRatePercent: 18','platformCommissionPercent: 15','tdsRatePercent: 1',"sellerGstin: '29AAAAA0000A1Z5'"]) expect(source).toContain(expected);
  });
  it('wires the tax calculator through the Financials composition module', () => {
    const source = fs.readFileSync(path.join(root, 'domains/financials/financials.module.ts'), 'utf8');
    expect(source).toContain('taxCalculator');
    expect(source).toContain('TaxCalculator');
  });
});
