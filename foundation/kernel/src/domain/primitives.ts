/** DomainEvent is an exported foundation/kernel contract/implementation; see the owning README for lifecycle and extension rules. */
export interface DomainEvent {
  eventName: string;
  occurredOn: Date;
}

/** ReadRepository is an exported foundation/kernel contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ReadRepository<T, TId = string> {
  findById(id: TId): Promise<T | null>;
  findAll?(): Promise<T[]>;
}

/** WriteRepository is an exported foundation/kernel contract/implementation; see the owning README for lifecycle and extension rules. */
export interface WriteRepository<T, TId = string> {
  save(entity: T): Promise<void>;
  delete?(id: TId): Promise<void>;
}

/** Repository is an exported foundation/kernel contract/implementation; see the owning README for lifecycle and extension rules. */
export interface Repository<T, TId = string> extends ReadRepository<T, TId>, WriteRepository<T, TId> {}
