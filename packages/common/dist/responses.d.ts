import { ApiResponse, PaginatedData } from '@carbroz/types';
export declare class ResponseHelper {
    static success<T>(data?: T, message?: string, traceId?: string): ApiResponse<T>;
    static created<T>(data?: T, message?: string, traceId?: string): ApiResponse<T>;
    static paginated<T>(paginatedData: PaginatedData<T>, message?: string, traceId?: string): ApiResponse<PaginatedData<T>>;
    static error(message: string, code?: string, traceId?: string): ApiResponse<null>;
    static noContent(): void;
}
