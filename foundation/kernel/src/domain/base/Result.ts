export class Result<T, E = Error> {
  private constructor(
    private readonly success: boolean,
    private readonly value?: T,
    private readonly error?: E,
  ) {}

  static ok<T, E = Error>(value?: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  static fail<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  get isSuccess(): boolean {
    return this.success;
  }

  get isFailure(): boolean {
    return !this.success;
  }

  getValue(): T {
    if (!this.success) throw new Error('Cannot get value from a failed Result. Use getError() instead.');
    return this.value as T;
  }

  getError(): E {
    if (this.success) throw new Error('Cannot get error from a successful Result.');
    return this.error as E;
  }
}
