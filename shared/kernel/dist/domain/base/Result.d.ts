export declare class Result<T, E = Error> {
    private readonly _isSuccess;
    private readonly _value?;
    private readonly _error?;
    private constructor();
    static ok<T, E = Error>(value?: T): Result<T, E>;
    static fail<T, E = Error>(error: E): Result<T, E>;
    get isSuccess(): boolean;
    get isFailure(): boolean;
    getValue(): T;
    getError(): E;
}
//# sourceMappingURL=Result.d.ts.map