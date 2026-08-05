import { AuditLog, AuditLogProps } from '../AuditLog.js';
import { IAuditLogRepository } from '../repositories/IAuditLogRepository.js';
export declare class AuditLogService {
    private readonly auditLogRepository;
    constructor(auditLogRepository: IAuditLogRepository);
    log(props: AuditLogProps): Promise<AuditLog | null>;
}
