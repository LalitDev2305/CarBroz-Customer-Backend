export declare class Money {
    readonly amount: number;
    readonly currency: string;
    constructor(amount: number, currency?: string);
    static zero(currency?: string): Money;
    get amountPaise(): number;
    static fromPaise(paise: number, currency?: string): Money;
    equals(other: Money): boolean;
    add(other: Money): Money;
}
