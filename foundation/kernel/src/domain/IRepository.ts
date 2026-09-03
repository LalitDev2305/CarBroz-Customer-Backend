import { type IReadRepository } from './IReadRepository.js';
import { type IWriteRepository } from './IWriteRepository.js';

export interface IRepository<TEntity, TId> extends IReadRepository<TEntity, TId>, IWriteRepository<TEntity, TId> {
}
