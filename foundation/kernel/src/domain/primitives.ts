export interface DomainEvent {
  eventName: string;
  occurredOn: Date;
}

export interface ReadRepository<T, TId = string> {
  findById(id: TId): Promise<T | null>;
  findAll?(): Promise<T[]>;
}

export interface WriteRepository<T, TId = string> {
  save(entity: T): Promise<void>;
  delete?(id: TId): Promise<void>;
}

export interface Repository<T, TId = string> extends ReadRepository<T, TId>, WriteRepository<T, TId> {}
