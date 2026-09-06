import type { IReadRepository } from './IReadRepository.js';
import type { IWriteRepository } from './IWriteRepository.js';

/** IRepository is an exported foundation/kernel contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IRepository<TEntity, TId>
  extends IReadRepository<TEntity, TId>, IWriteRepository<TEntity, TId> {}
