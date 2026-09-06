import type {
  AuditAction,
  AuditLog,
  IAuditLogRepository,
} from "@carbroz/domain-audit";

/** Audit-owned observability seam; infrastructure logging is injected by composition. */
export interface IAuditFailureObserver {
  error(
    message: string,
    error?: Error | unknown,
    context?: Record<string, unknown>,
  ): void;
}

export class AuditLogService {
  constructor(
    private readonly auditLogRepository: IAuditLogRepository,
    private readonly logger: IAuditFailureObserver,
  ) {}

  async log(input: {
    actorUserId?: number;
    action: AuditAction;
    targetType: string;
    targetPublicId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const log: AuditLog = {
      actorUserId: input.actorUserId,
      action: input.action,
      targetType: input.targetType,
      targetPublicId: input.targetPublicId,
      metadata: input.metadata,
    };
    try {
      await this.auditLogRepository.create(log);
    } catch (error) {
      this.logger.error("Audit persistence failed", error, {
        event: "audit.persistence.failed",
        action: input.action,
        targetType: input.targetType,
      });
      // Audit persistence remains non-blocking for the originating business flow.
    }
  }
}
