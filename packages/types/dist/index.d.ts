export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    code?: string;
    traceId?: string;
}
export interface PaginationOptions {
    page: number;
    limit: number;
}
export interface PaginatedData<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface RequestContext {
    traceId: string;
    requestStartTime: number;
}
export type Environment = 'development' | 'test' | 'production';
