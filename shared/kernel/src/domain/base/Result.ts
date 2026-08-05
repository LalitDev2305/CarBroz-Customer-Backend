export class Result<T, E = Error> {
  private readonly _isSuccess: boolean;
  private readonly _value?: T | undefined;
  private readonly _error?: E | undefined;

  private constructor(isSuccess: boolean, value?: T | undefined, error?: E | undefined) {
    this._isSuccess = isSuccess;
    if (value !== undefined) {
      this._value = value;
    }
    if (error !== undefined) {
      this._error = error;
    }
  }

  public static ok<T, E = Error>(value?: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  public static fail<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  public getValue(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from a failed Result. Use getError() instead.');
    }
    return this._value as T;
  }

  public getError(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from a successful Result.');
    }
    return this._error as E;
  }
}
