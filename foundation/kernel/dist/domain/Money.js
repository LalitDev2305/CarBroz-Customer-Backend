export class Money {
    amount;
    currency;
    constructor(amount, currency = 'INR') {
        this.amount = amount;
        this.currency = currency;
        if (amount < 0) {
            throw new Error('Money amount cannot be negative');
        }
    }
    get amountPaise() {
        return this.amount;
    }
    add(other) {
        this.ensureSameCurrency(other);
        return new Money(this.amount + other.amount, this.currency);
    }
    subtract(other) {
        this.ensureSameCurrency(other);
        return new Money(this.amount - other.amount, this.currency);
    }
    multiply(multiplier) {
        return new Money(Math.round(this.amount * multiplier), this.currency);
    }
    equals(other) {
        return this.amount === other.amount && this.currency === other.currency;
    }
    ensureSameCurrency(other) {
        if (this.currency !== other.currency) {
            throw new Error(`Cannot operate on different currencies: ${this.currency} and ${other.currency}`);
        }
    }
    static fromPaise(amountInPaise, currency = 'INR') {
        return new Money(amountInPaise, currency);
    }
    static zero(currency = 'INR') {
        return new Money(0, currency);
    }
}
//# sourceMappingURL=Money.js.map