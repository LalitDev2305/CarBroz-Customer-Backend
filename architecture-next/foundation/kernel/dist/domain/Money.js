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
            throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
        }
    }
}
//# sourceMappingURL=Money.js.map