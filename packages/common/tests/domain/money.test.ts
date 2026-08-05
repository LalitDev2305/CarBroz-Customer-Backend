import { describe, expect, it } from 'vitest';
import { Money } from '../../src/domain/value-objects/Money.js';

describe('Money Value Object', () => {
  it('should create valid Money in integer paise', () => {
    const m = Money.fromPaise(5000, 'INR');
    expect(m.amountPaise).toBe(5000);
    expect(m.currency).toBe('INR');
  });

  it('should reject non-integer, negative, or unsafe amounts', () => {
    expect(() => Money.fromPaise(10.5)).toThrow('integer');
    expect(() => Money.fromPaise(-100)).toThrow('negative');
    expect(() => Money.fromPaise(Number.MAX_SAFE_INTEGER + 1)).toThrow('safe integer');
  });

  it('should add and subtract Money with same currency', () => {
    const m1 = Money.fromPaise(3000, 'INR');
    const m2 = Money.fromPaise(2000, 'INR');

    const sum = m1.add(m2);
    expect(sum.amountPaise).toBe(5000);

    const diff = m1.subtract(m2);
    expect(diff.amountPaise).toBe(1000);
  });

  it('should throw error when subtracting larger amount', () => {
    const m1 = Money.fromPaise(1000, 'INR');
    const m2 = Money.fromPaise(2000, 'INR');
    expect(() => m1.subtract(m2)).toThrow('negative Money');
  });

  it('should throw error on currency mismatch', () => {
    const inr = Money.fromPaise(1000, 'INR');
    const usd = Money.fromPaise(1000, 'USD');
    expect(() => inr.add(usd)).toThrow('Currency mismatch');
  });

  it('should compare Money objects correctly', () => {
    const m1 = Money.fromPaise(1000, 'INR');
    const m2 = Money.fromPaise(2000, 'INR');
    const m3 = Money.fromPaise(1000, 'INR');

    expect(m1.lessThan(m2)).toBe(true);
    expect(m2.greaterThan(m1)).toBe(true);
    expect(m1.equals(m3)).toBe(true);
  });
});
