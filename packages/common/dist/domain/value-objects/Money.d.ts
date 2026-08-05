export declare class Money {
    private readonly _amountPaise;
    private readonly _currency;
    constructor(amountPaise: number, currency?: string);
    static fromPaise(amountPaise: number, currency?: string): Money;
    static zero(currency?: string): Money;
    get amountPaise(): number;
    get currency(): string;
    add(other: Money): Money;
    subtract(other: Money): Money;
    equals(other: Money): boolean;
    greaterThan(other: Money): boolean;
    lessThan(other: Money): boolean;
    private ensureSameCurrency;
}
