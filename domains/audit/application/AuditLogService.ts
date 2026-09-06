import { AuditLog, type AuditLogProps } from '../domain/AuditLog.js';
import type { IAuditLogRepository } from '../domain/repositories/IAuditLogRepository.js';

/** Audit-owned semantic logging port; composition supplies the canonical observability adapter. */
export interface IAuditFailureLogger {
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
}

/** AuditLogService persists business/security audit records without bypassing observability. */
export class AuditLogService {
  constructor(
    private readonly auditLogRepository: IAuditLogRepository,
    private readonly logger: IAuditFailureLogger,
  ) {}

  async log(props: AuditLogProps): Promise<AuditLog | null> {
    try {
      const auditLog = new AuditLog(props);
      return await this.auditLogRepository.create(auditLog);
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error('Unknown audit persistence failure');
      this.logger.error('audit.persistence.failed', normalizedError, {
        action: props.action,
        resource: props.resource,
        correlationId: props.correlationId ?? undefined,
      });
      return null;
    }
  }
}
