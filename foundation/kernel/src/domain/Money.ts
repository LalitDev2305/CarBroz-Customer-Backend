export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'INR'
  ) {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
  }

  public static zero(currency: string = 'INR'): Money {
    return new Money(0, currency);
  }

  public get amountPaise(): number {
    return Math.round(this.amount * 100);
  }

  public static fromPaise(paise: number, currency: string = 'INR'): Money {
    return new Money(paise / 100, currency);
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Currency mismatch');
    }
    return new Money(this.amount + other.amount, this.currency);
  }
}
