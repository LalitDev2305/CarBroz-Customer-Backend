import { describe, expect, it, vi } from 'vitest';
import { AuditActor, AuditLog, AuditLogService, type IAuditLogRepository } from '@carbroz/domain-audit';

describe('Phase 20 — Audit Logging Domain Model & Service', () => {
  it('should create a valid AuditLog entity with defaults', () => {
    const actor = new AuditActor({ actorId: 10, actorType: 'CUSTOMER' });
    const auditLog = new AuditLog({
      actorId: actor.actorId,
      actorType: actor.actorType,
      action: 'BOOKING_CREATE',
      resource: 'Booking',
      resourcePublicId: '80000000-0000-0000-0000-000000000101',
      newValue: { totalPricePaise: 50000 },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });

    expect(auditLog.action).toBe('BOOKING_CREATE');
    expect(auditLog.resource).toBe('Booking');
    expect(auditLog.actorType).toBe('CUSTOMER');
    expect(auditLog.actorId).toBe(10);
  });

  it('should log audit events non-blockingly via AuditLogService', async () => {
    const logs: AuditLog[] = [];
    const mockRepo: IAuditLogRepository = {
      async create(log) {
        log.id = 1;
        logs.push(log);
        return log;
      },
      async findByPublicId() { return null; },
      async listByResource() { return []; },
      async listByActor() { return []; },
    };
    const logger = { error: vi.fn() };

    const auditService = new AuditLogService(mockRepo, logger);
    const result = await auditService.log({
      action: 'PAYMENT_CREATE',
      resource: 'Payment',
      resourcePublicId: 'pay_12345',
    });

    expect(result).not.toBeNull();
    expect(logs.length).toBe(1);
    expect(logs[0]?.action).toBe('PAYMENT_CREATE');
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should swallow persistence errors while reporting them through observability', async () => {
    const failingRepo: IAuditLogRepository = {
      async create() { throw new Error('Database connection failed'); },
      async findByPublicId() { return null; },
      async listByResource() { return []; },
      async listByActor() { return []; },
    };
    const logger = { error: vi.fn() };

    const auditService = new AuditLogService(failingRepo, logger);
    const result = await auditService.log({
      action: 'SYSTEM_OPERATION',
      resource: 'System',
      correlationId: 'audit-correlation-1',
    });

    expect(result).toBeNull();
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      'audit.persistence.failed',
      expect.objectContaining({ message: 'Database connection failed' }),
      {
        action: 'SYSTEM_OPERATION',
        resource: 'System',
        correlationId: 'audit-correlation-1',
      },
    );
  });
});
