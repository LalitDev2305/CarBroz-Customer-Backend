import { describe, expect, it } from 'vitest';
import { Money } from '../../src/domain/value-objects/Money.js';

describe('Money Value Object', () => {
  it('should create valid Money in integer minor units', () => {
    const m = Money.fromMinor(5000, 'INR');
    expect(m.amountMinor).toBe(5000);
    expect(m.currency).toBe('INR');
  });

  it('should reject non-integer, negative, or unsafe amounts', () => {
    expect(() => Money.fromMinor(10.5)).toThrow('integer');
    expect(() => Money.fromMinor(-100)).toThrow('negative');
    expect(() => Money.fromMinor(Number.MAX_SAFE_INTEGER + 1)).toThrow('safe integer');
  });

  it('should add and subtract Money with same currency', () => {
    const m1 = Money.fromMinor(3000, 'INR');
    const m2 = Money.fromMinor(2000, 'INR');

    const sum = m1.add(m2);
    expect(sum.amountMinor).toBe(5000);

    const diff = m1.subtract(m2);
    expect(diff.amountMinor).toBe(1000);
  });

  it('should throw error when subtracting larger amount', () => {
    const m1 = Money.fromMinor(1000, 'INR');
    const m2 = Money.fromMinor(2000, 'INR');
    expect(() => m1.subtract(m2)).toThrow('negative Money');
  });

  it('should throw error on currency mismatch', () => {
    const inr = Money.fromMinor(1000, 'INR');
    const usd = Money.fromMinor(1000, 'USD');
    expect(() => inr.add(usd)).toThrow('Currency mismatch');
  });

  it('should compare Money objects correctly', () => {
    const m1 = Money.fromMinor(1000, 'INR');
    const m2 = Money.fromMinor(2000, 'INR');
    const m3 = Money.fromMinor(1000, 'INR');

    expect(m1.lessThan(m2)).toBe(true);
    expect(m2.greaterThan(m1)).toBe(true);
    expect(m1.equals(m3)).toBe(true);
  });
});
