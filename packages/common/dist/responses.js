export class ResponseHelper {
    static success(data, message = 'Success', traceId) {
        return {
            success: true,
            message,
            data,
            traceId,
        };
    }
    static created(data, message = 'Created', traceId) {
        return {
            success: true,
            message,
            data,
            traceId,
        };
    }
    static paginated(paginatedData, message = 'Success', traceId) {
        return {
            success: true,
            message,
            data: paginatedData,
            traceId,
        };
    }
    static error(message, code = 'ERROR', traceId) {
        return {
            success: false,
            message,
            code,
            traceId,
        };
    }
    static noContent() {
        return;
    }
}
//# sourceMappingURL=responses.js.map