import { asClass, type AwilixContainer } from 'awilix';
import { AuditLogService } from './application/AuditLogService.js';
import { PrismaAuditLogRepository } from './infrastructure/repositories/PrismaAuditLogRepository.js';

/** registerAuditModule is an exported domains/audit contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerAuditModule(container: AwilixContainer): void {
  container.register({
    auditLogRepository: asClass(PrismaAuditLogRepository).singleton(),
    auditLogService: asClass(AuditLogService).singleton(),
  });
}
