export interface IRequestContext {
    correlationId: string;
    requestId: string;
    traceId: string;
    spanId: string;
    authenticatedUser?: Record<string, unknown>;
    guestUser?: Record<string, unknown>;
    locale: string;
    timezone: string;
}
