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
    static zero(currency = 'INR') {
        return new Money(0, currency);
    }
    get amountPaise() {
        return Math.round(this.amount * 100);
    }
    static fromPaise(paise, currency = 'INR') {
        return new Money(paise / 100, currency);
    }
    equals(other) {
        return this.amount === other.amount && this.currency === other.currency;
    }
    add(other) {
        if (this.currency !== other.currency) {
            throw new Error('Currency mismatch');
        }
        return new Money(this.amount + other.amount, this.currency);
    }
}
//# sourceMappingURL=Money.js.map