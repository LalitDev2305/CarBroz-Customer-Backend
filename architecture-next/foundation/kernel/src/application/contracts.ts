export interface RequestContext {
  correlationId?: string;
  userId?: string;
  userRole?: string;
  tenantId?: string;
  timestamp: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: Record<string, any>;
}

export interface UseCase<TRequest = any, TResponse = any> {
  execute(request: TRequest, context?: RequestContext): Promise<TResponse>;
}
