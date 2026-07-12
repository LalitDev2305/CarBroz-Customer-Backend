import { ApiResponse, PaginatedData } from '@carbroz/types';

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
