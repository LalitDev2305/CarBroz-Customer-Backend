export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'INR'
  ) {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
  }

  get amountPaise(): number {
    return this.amount;
  }



  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(multiplier: number): Money {
    return new Money(Math.round(this.amount * multiplier), this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot operate on different currencies: ${this.currency} and ${other.currency}`);
    }
  }

  static fromPaise(amountInPaise: number, currency: string = 'INR'): Money {
    return new Money(amountInPaise, currency);
  }

  static zero(currency: string = 'INR'): Money {
    return new Money(0, currency);
  }
}
