export class Result {
    _isSuccess;
    _value;
    _error;
    constructor(isSuccess, value, error) {
        this._isSuccess = isSuccess;
        if (value !== undefined) {
            this._value = value;
        }
        if (error !== undefined) {
            this._error = error;
        }
    }
    static ok(value) {
        return new Result(true, value, undefined);
    }
    static fail(error) {
        return new Result(false, undefined, error);
    }
    get isSuccess() {
        return this._isSuccess;
    }
    get isFailure() {
        return !this._isSuccess;
    }
    getValue() {
        if (!this._isSuccess) {
            throw new Error('Cannot get value from a failed Result. Use getError() instead.');
        }
        return this._value;
    }
    getError() {
        if (this._isSuccess) {
            throw new Error('Cannot get error from a successful Result.');
        }
        return this._error;
    }
}
//# sourceMappingURL=Result.js.map