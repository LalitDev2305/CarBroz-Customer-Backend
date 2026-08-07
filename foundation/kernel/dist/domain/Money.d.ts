export declare class Money {
    readonly amount: number;
    readonly currency: string;
    constructor(amount: number, currency?: string);
    get amountPaise(): number;
    add(other: Money): Money;
    subtract(other: Money): Money;
    multiply(multiplier: number): Money;
    equals(other: Money): boolean;
    private ensureSameCurrency;
    static fromPaise(amountInPaise: number, currency?: string): Money;
    static zero(currency?: string): Money;
}
