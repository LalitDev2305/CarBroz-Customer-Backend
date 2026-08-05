export class Money {
    _amountPaise;
    _currency;
    constructor(amountPaise, currency = 'INR') {
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
    static fromPaise(amountPaise, currency = 'INR') {
        return new Money(amountPaise, currency);
    }
    static zero(currency = 'INR') {
        return new Money(0, currency);
    }
    get amountPaise() {
        return this._amountPaise;
    }
    get currency() {
        return this._currency;
    }
    add(other) {
        this.ensureSameCurrency(other);
        return new Money(this._amountPaise + other._amountPaise, this._currency);
    }
    subtract(other) {
        this.ensureSameCurrency(other);
        if (this._amountPaise < other._amountPaise) {
            throw new Error(`Cannot subtract ${other._amountPaise} from ${this._amountPaise} without resulting in negative Money`);
        }
        return new Money(this._amountPaise - other._amountPaise, this._currency);
    }
    equals(other) {
        return this._amountPaise === other._amountPaise && this._currency === other._currency;
    }
    greaterThan(other) {
        this.ensureSameCurrency(other);
        return this._amountPaise > other._amountPaise;
    }
    lessThan(other) {
        this.ensureSameCurrency(other);
        return this._amountPaise < other._amountPaise;
    }
    ensureSameCurrency(other) {
        if (this._currency !== other._currency) {
            throw new Error(`Currency mismatch: ${this._currency} vs ${other._currency}`);
        }
    }
}
//# sourceMappingURL=Money.js.map