export type ActorType = 'CUSTOMER' | 'PARTNER' | 'ADMIN' | 'SYSTEM';

export interface AuditActorProps {
  actorId?: number | null;
  actorType?: ActorType;
}

export class AuditActor {
  actorId: number | null;
  actorType: ActorType;

  constructor(props: AuditActorProps) {
    this.actorId = props.actorId ?? null;
    this.actorType = props.actorType ?? 'SYSTEM';
  }
}
