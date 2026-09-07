export const BASIS_POINTS_SCALE = 10_000;

/** Converts a non-negative rate such as 1.25 to integer basis points (12_500). */
export function rateToBasisPoints(rate: number): number {
  if (!Number.isFinite(rate) || rate < 0) {
    throw new Error(`Rate must be a finite non-negative number, received: ${rate}`);
  }
  const basisPoints = Math.round(rate * BASIS_POINTS_SCALE);
  if (!Number.isSafeInteger(basisPoints)) {
    throw new Error(`Rate exceeds maximum safe basis-point range: ${rate}`);
  }
  return basisPoints;
}

/**
 * Applies an integer basis-point rate to an integer minor-unit amount using
 * BigInt arithmetic and deterministic half-up rounding. Monetary arithmetic
 * never passes through a floating-point intermediate.
 */
export function applyBasisPointsToMinorUnits(
  amountMinor: number,
  basisPoints: number,
): number {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new Error(`Minor-unit amount must be a safe integer, received: ${amountMinor}`);
  }
  if (!Number.isSafeInteger(basisPoints) || basisPoints < 0) {
    throw new Error(`Basis points must be a non-negative safe integer, received: ${basisPoints}`);
  }

  const scale = BigInt(BASIS_POINTS_SCALE);
  const numerator = BigInt(amountMinor) * BigInt(basisPoints);
  const rounded = numerator >= 0n
    ? (numerator + scale / 2n) / scale
    : (numerator - scale / 2n) / scale;
  const result = Number(rounded);
  if (!Number.isSafeInteger(result)) {
    throw new Error(`Calculated minor-unit amount exceeds maximum safe integer range: ${rounded}`);
  }
  return result;
}

/** Money is an exported foundation/kernel contract/implementation; see the owning README for lifecycle and extension rules. */
export class Money {
  private readonly _amountMinor: number;
  private readonly _currency: string;

  constructor(amountMinor: number, currency = 'INR') {
    if (!Number.isInteger(amountMinor)) {
      throw new Error(`Money amount must be an integer in minor units, received: ${amountMinor}`);
    }
    if (!Number.isSafeInteger(amountMinor)) {
      throw new Error(`Money amount exceeds maximum safe integer range: ${amountMinor}`);
    }
    if (amountMinor < 0) {
      throw new Error(`Money amount cannot be negative: ${amountMinor}`);
    }
    if (typeof currency !== 'string' || currency.trim().length === 0) {
      throw new Error('Valid currency code is required');
    }

    this._amountMinor = amountMinor;
    this._currency = currency.trim().toUpperCase();
  }

  static fromMinor(amountMinor: number, currency = 'INR'): Money {
    return new Money(amountMinor, currency);
  }

  static zero(currency = 'INR'): Money {
    return new Money(0, currency);
  }

  get amountMinor(): number {
    return this._amountMinor;
  }

  get currency(): string {
    return this._currency;
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this._amountMinor + other._amountMinor, this._currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    if (this._amountMinor < other._amountMinor) {
      throw new Error(
        `Cannot subtract ${other._amountMinor} from ${this._amountMinor} without resulting in negative Money`,
      );
    }
    return new Money(this._amountMinor - other._amountMinor, this._currency);
  }

  /** Compatibility API: the rate is quantized first; the money calculation is integer-only. */
  multiply(multiplier: number): Money {
    return this.multiplyBasisPoints(rateToBasisPoints(multiplier));
  }

  multiplyBasisPoints(basisPoints: number): Money {
    return new Money(
      applyBasisPointsToMinorUnits(this._amountMinor, basisPoints),
      this._currency,
    );
  }

  equals(other: Money): boolean {
    return this._amountMinor === other._amountMinor && this._currency === other._currency;
  }

  greaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this._amountMinor > other._amountMinor;
  }

  lessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this._amountMinor < other._amountMinor;
  }

  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(`Currency mismatch: ${this._currency} vs ${other._currency}`);
    }
  }
}
