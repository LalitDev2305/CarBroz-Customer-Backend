import { AuditLog, AuditLogProps } from '../AuditLog.js';
import { IAuditLogRepository } from '../repositories/IAuditLogRepository.js';

export class AuditLogService {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async log(props: AuditLogProps): Promise<AuditLog | null> {
    try {
      const auditLog = new AuditLog(props);
      return await this.auditLogRepository.create(auditLog);
    } catch (error) {
      // Non-blocking: audit log failure must never interrupt business execution flow
      console.error('[AuditLogService] Non-blocking audit log error:', error);
      return null;
    }
  }
}
