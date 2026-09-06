/** ActorType is an exported domains/audit contract/implementation; see the owning README for lifecycle and extension rules. */
export type ActorType = 'CUSTOMER' | 'PARTNER' | 'ADMIN' | 'SYSTEM';

/** AuditActorProps is an exported domains/audit contract/implementation; see the owning README for lifecycle and extension rules. */
export interface AuditActorProps {
  actorId?: number | null;
  actorType?: ActorType;
}

/** AuditActor is an exported domains/audit contract/implementation; see the owning README for lifecycle and extension rules. */
export class AuditActor {
  actorId: number | null;
  actorType: ActorType;

  constructor(props: AuditActorProps) {
    this.actorId = props.actorId ?? null;
    this.actorType = props.actorType ?? 'SYSTEM';
  }
}
