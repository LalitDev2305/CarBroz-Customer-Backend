import { AuditLog } from '../AuditLog.js';

export interface IAuditLogRepository {
  create(auditLog: AuditLog): Promise<AuditLog>;
  findByPublicId(publicId: string): Promise<AuditLog | null>;
  listByResource(resource: string, resourcePublicId?: string, limit?: number, offset?: number): Promise<AuditLog[]>;
  listByActor(actorId: number, limit?: number, offset?: number): Promise<AuditLog[]>;
}
