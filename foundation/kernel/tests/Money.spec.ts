import { describe, expect, it } from 'vitest';
import { Money } from '../src/domain/Money.js';

describe('Money', () => {
  it('stores integer minor units and normalizes currency', () => {
    const money = new Money(1234, 'inr');
    expect(money.amountMinor).toBe(1234);
    expect(money.currency).toBe('INR');
  });

  it('creates zero and values from minor units', () => {
    expect(Money.zero().equals(new Money(0, 'INR'))).toBe(true);
    expect(Money.fromMinor(250, 'usd').equals(new Money(250, 'USD'))).toBe(true);
  });

  it('rejects invalid minor-unit amounts', () => {
    expect(() => new Money(1.5)).toThrow('integer in minor units');
    expect(() => new Money(Number.MAX_SAFE_INTEGER + 1)).toThrow('maximum safe integer');
    expect(() => new Money(-1)).toThrow('cannot be negative');
  });

  it('rejects blank currency codes', () => {
    expect(() => new Money(100, '')).toThrow('Valid currency code');
    expect(() => new Money(100, '   ')).toThrow('Valid currency code');
  });

  it('adds, subtracts, and compares same-currency money', () => {
    const left = new Money(500);
    const right = new Money(200);

    expect(left.add(right).amountMinor).toBe(700);
    expect(left.subtract(right).amountMinor).toBe(300);
    expect(left.greaterThan(right)).toBe(true);
    expect(right.lessThan(left)).toBe(true);
    expect(left.equals(new Money(500))).toBe(true);
  });

  it('rejects subtraction that would create negative money', () => {
    expect(() => new Money(100).subtract(new Money(101))).toThrow('without resulting in negative Money');
  });

  it('rejects cross-currency arithmetic and comparisons', () => {
    const inr = new Money(100, 'INR');
    const usd = new Money(100, 'USD');

    expect(() => inr.add(usd)).toThrow('Currency mismatch');
    expect(() => inr.subtract(usd)).toThrow('Currency mismatch');
    expect(() => inr.greaterThan(usd)).toThrow('Currency mismatch');
    expect(() => inr.lessThan(usd)).toThrow('Currency mismatch');
  });

  it('multiplies with deterministic minor-unit rounding', () => {
    expect(new Money(101).multiply(1.5).amountMinor).toBe(152);
  });

  it('rejects invalid multipliers', () => {
    expect(() => new Money(100).multiply(-1)).toThrow('finite non-negative');
    expect(() => new Money(100).multiply(Number.NaN)).toThrow('finite non-negative');
    expect(() => new Money(100).multiply(Number.POSITIVE_INFINITY)).toThrow('finite non-negative');
  });
});
