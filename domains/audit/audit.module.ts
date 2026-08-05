import { asClass, type AwilixContainer } from 'awilix';
import { PrismaAuditLogRepository } from './infrastructure/repositories/PrismaAuditLogRepository.js';

export function registerAuditModule(container: AwilixContainer): void {
  container.register({
    auditLogRepository: asClass(PrismaAuditLogRepository).singleton(),
  });
}
