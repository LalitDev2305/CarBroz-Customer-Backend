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

