import { asClass } from 'awilix';
import { PrismaAuditLogRepository } from './infrastructure/repositories/PrismaAuditLogRepository.js';
export function registerAuditModule(container) {
    container.register({
        auditLogRepository: asClass(PrismaAuditLogRepository).singleton(),
    });
}
//# sourceMappingURL=audit.module.js.map