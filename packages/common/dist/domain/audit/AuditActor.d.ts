export type ActorType = 'CUSTOMER' | 'PARTNER' | 'ADMIN' | 'SYSTEM';
export interface AuditActorProps {
    actorId?: number | null;
    actorType?: ActorType;
}
export declare class AuditActor {
    actorId: number | null;
    actorType: ActorType;
    constructor(props: AuditActorProps);
}
