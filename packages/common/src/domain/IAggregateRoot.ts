import { IEntity } from './IEntity.js';

export interface IAggregateRoot<TId> extends IEntity<TId> {
  // Marker interface for Aggregate Roots
}
