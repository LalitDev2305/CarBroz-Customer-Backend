export class Money {
  private readonly _amountPaise: number;
  private readonly _currency: string;

  constructor(amountPaise: number, currency = 'INR') {
    if (!Number.isInteger(amountPaise)) {
      throw new Error(`Money amount must be an integer in paise, received: ${amountPaise}`);
    }
    if (!Number.isSafeInteger(amountPaise)) {
      throw new Error(`Money amount exceeds maximum safe integer range: ${amountPaise}`);
    }
    if (amountPaise < 0) {
      throw new Error(`Money amount cannot be negative: ${amountPaise}`);
    }
    if (!currency || typeof currency !== 'string') {
      throw new Error('Valid currency code is required');
    }

    this._amountPaise = amountPaise;
    this._currency = currency.toUpperCase();
  }

  static fromPaise(amountPaise: number, currency = 'INR'): Money {
    return new Money(amountPaise, currency);
  }

  static zero(currency = 'INR'): Money {
    return new Money(0, currency);
  }

  get amountPaise(): number {
    return this._amountPaise;
  }

  get currency(): string {
    return this._currency;
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this._amountPaise + other._amountPaise, this._currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    if (this._amountPaise < other._amountPaise) {
      throw new Error(
        `Cannot subtract ${other._amountPaise} from ${this._amountPaise} without resulting in negative Money`
      );
    }
    return new Money(this._amountPaise - other._amountPaise, this._currency);
  }

  equals(other: Money): boolean {
    return this._amountPaise === other._amountPaise && this._currency === other._currency;
  }

  greaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this._amountPaise > other._amountPaise;
  }

  lessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this._amountPaise < other._amountPaise;
  }

  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(`Currency mismatch: ${this._currency} vs ${other._currency}`);
    }
  }
}
