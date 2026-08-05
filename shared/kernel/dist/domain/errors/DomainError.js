export class DomainError extends Error {
    code;
    constructor(message, code = 'DOMAIN_ERROR') {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=DomainError.js.map