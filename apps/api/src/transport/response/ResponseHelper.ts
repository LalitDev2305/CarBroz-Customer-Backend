/** HTTP response-envelope helper owned exclusively by the API transport layer. */
export type ApiResponseCode =
  | 'SUCCESS'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_SERVER_ERROR';

export type ApiResponseStatus = 200 | 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500;
export type ApiErrorStatus = Exclude<ApiResponseStatus, 200>;

export interface ApiResponse<T = any> {
  status: ApiResponseStatus;
  code: ApiResponseCode;
  message: string;
  data?: T;
  traceId?: string;
}

/** PaginationOptions is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/** PaginatedData is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** RequestContext is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export interface RequestContext {
  traceId: string;
  requestStartTime: number;
}

/** Environment is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type Environment = 'development' | 'test' | 'production';

const RESPONSE_CODE_BY_STATUS: Record<ApiResponseStatus, ApiResponseCode> = {
  200: 'SUCCESS',
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
};

/** ResponseHelper is the canonical API transport envelope factory. */
export class ResponseHelper {
  static success<T>(data?: T, message: string = 'Request completed successfully.', traceId?: string): ApiResponse<T> {
    return {
      status: 200,
      code: 'SUCCESS',
      message,
      data,
      traceId,
    };
  }

  /** Creation currently uses the frozen CarBroz success status contract (HTTP 200). */
  static created<T>(data?: T, message: string = 'Resource created successfully.', traceId?: string): ApiResponse<T> {
    return ResponseHelper.success(data, message, traceId);
  }

  static paginated<T>(
    paginatedData: PaginatedData<T>,
    message: string = 'Request completed successfully.',
    traceId?: string,
  ): ApiResponse<PaginatedData<T>> {
    return ResponseHelper.success(paginatedData, message, traceId);
  }

  static error(status: ApiErrorStatus, message: string, traceId?: string): ApiResponse<null> {
    return {
      status,
      code: RESPONSE_CODE_BY_STATUS[status],
      message,
      data: null,
      traceId,
    };
  }

  static noContent(): void {
    return;
  }
}
