import { asClass, type AwilixContainer } from 'awilix';
import { AuditLogService } from './application/AuditLogService.js';
import { PrismaAuditLogRepository } from './infrastructure/repositories/PrismaAuditLogRepository.js';

export function registerAuditModule(container: AwilixContainer): void {
  container.register({
    auditLogRepository: asClass(PrismaAuditLogRepository).singleton(),
    auditLogService: asClass(AuditLogService).singleton(),
  });
}
