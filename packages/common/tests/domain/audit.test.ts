import { describe, expect, it } from 'vitest';
import { AuditActor, AuditLog, AuditLogService, type IAuditLogRepository } from '../../src/index.js';

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

    const auditService = new AuditLogService(mockRepo);
    const result = await auditService.log({
      action: 'PAYMENT_CREATE',
      resource: 'Payment',
      resourcePublicId: 'pay_12345',
    });

    expect(result).not.toBeNull();
    expect(logs.length).toBe(1);
    expect(logs[0]?.action).toBe('PAYMENT_CREATE');
  });

  it('should swallow errors safely in AuditLogService without throwing', async () => {
    const failingRepo: IAuditLogRepository = {
      async create() { throw new Error('Database connection failed'); },
      async findByPublicId() { return null; },
      async listByResource() { return []; },
      async listByActor() { return []; },
    };

    const auditService = new AuditLogService(failingRepo);
    const result = await auditService.log({
      action: 'SYSTEM_OPERATION',
      resource: 'System',
    });

    expect(result).toBeNull(); // Gracefully returns null without throwing exception
  });
});
