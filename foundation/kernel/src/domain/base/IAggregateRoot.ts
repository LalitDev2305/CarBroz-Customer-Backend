import type { IEntity } from './IEntity.js';

/** IAggregateRoot is an exported foundation/kernel contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IAggregateRoot<TId> extends IEntity<TId> {}
