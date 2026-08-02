import { IReadRepository } from './IReadRepository.js';
import { IWriteRepository } from './IWriteRepository.js';
export interface IRepository<TEntity, TId> extends IReadRepository<TEntity, TId>, IWriteRepository<TEntity, TId> {
}
