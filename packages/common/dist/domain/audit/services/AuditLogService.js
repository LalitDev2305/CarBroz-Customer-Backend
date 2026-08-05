import { AuditLog } from '../AuditLog.js';
export class AuditLogService {
    auditLogRepository;
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    async log(props) {
        try {
            const auditLog = new AuditLog(props);
            return await this.auditLogRepository.create(auditLog);
        }
        catch (error) {
            // Non-blocking: audit log failure must never interrupt business execution flow
            console.error('[AuditLogService] Non-blocking audit log error:', error);
            return null;
        }
    }
}
//# sourceMappingURL=AuditLogService.js.map