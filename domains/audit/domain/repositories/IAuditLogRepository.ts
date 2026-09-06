import type { AuditLog } from '../AuditLog.js';

/** IAuditLogRepository is an exported domains/audit contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IAuditLogRepository {
  create(auditLog: AuditLog): Promise<AuditLog>;
  findByPublicId(publicId: string): Promise<AuditLog | null>;
  listByResource(
    resource: string,
    resourcePublicId?: string,
    limit?: number,
    offset?: number,
  ): Promise<AuditLog[]>;
  listByActor(actorId: number, limit?: number, offset?: number): Promise<AuditLog[]>;
}
