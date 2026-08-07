export var KernelErrorCode;
(function (KernelErrorCode) {
    KernelErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    KernelErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    KernelErrorCode["FORBIDDEN"] = "FORBIDDEN";
    KernelErrorCode["NOT_FOUND"] = "NOT_FOUND";
    KernelErrorCode["CONFLICT"] = "CONFLICT";
    KernelErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
})(KernelErrorCode || (KernelErrorCode = {}));
export class KernelError extends Error {
    code;
    statusCode;
    details;
    constructor(code, message, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'KernelError';
    }
}
//# sourceMappingURL=errors.js.map