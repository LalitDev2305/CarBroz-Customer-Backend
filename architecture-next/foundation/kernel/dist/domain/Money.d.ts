export declare class Money {
    readonly amount: number;
    readonly currency: string;
    constructor(amount: number, currency?: string);
    add(other: Money): Money;
    subtract(other: Money): Money;
    multiply(multiplier: number): Money;
    equals(other: Money): boolean;
    private ensureSameCurrency;
}
