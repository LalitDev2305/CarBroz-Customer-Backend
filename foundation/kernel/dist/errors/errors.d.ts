export declare enum KernelErrorCode {
    INVALID_INPUT = "INVALID_INPUT",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    INTERNAL_ERROR = "INTERNAL_ERROR"
}
export declare class KernelError extends Error {
    readonly code: KernelErrorCode | string;
    readonly statusCode: number;
    readonly details?: any | undefined;
    constructor(code: KernelErrorCode | string, message: string, statusCode?: number, details?: any | undefined);
}
