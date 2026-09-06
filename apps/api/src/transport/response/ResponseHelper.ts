/** HTTP response-envelope helper owned exclusively by the API transport layer. */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
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

/** ResponseHelper is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export class ResponseHelper {
  static success<T>(data?: T, message: string = 'Success', traceId?: string): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      traceId,
    };
  }

  static created<T>(data?: T, message: string = 'Created', traceId?: string): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      traceId,
    };
  }

  static paginated<T>(paginatedData: PaginatedData<T>, message: string = 'Success', traceId?: string): ApiResponse<PaginatedData<T>> {
    return {
      success: true,
      message,
      data: paginatedData,
      traceId,
    };
  }

  static error(message: string, code: string = 'ERROR', traceId?: string): ApiResponse<null> {
    return {
      success: false,
      message,
      code,
      traceId,
    };
  }

  static noContent(): void {
    return;
  }
}

