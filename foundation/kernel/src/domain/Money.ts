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

  static fromPaise(amountPaise: number, currency = 'INR'): Money {
    return new Money(amountPaise, currency);
  }

  static zero(currency = 'INR'): Money {
    return new Money(0, currency);
  }

  get amountMinor(): number {
    return this._amountMinor;
  }

  get amountPaise(): number {
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

  multiply(multiplier: number): Money {
    if (!Number.isFinite(multiplier) || multiplier < 0) {
      throw new Error(`Money multiplier must be a finite non-negative number, received: ${multiplier}`);
    }
    return new Money(Math.round(this._amountMinor * multiplier), this._currency);
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
