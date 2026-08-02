import { Permission } from '../Permission.js';
import { IReadRepository } from '../IReadRepository.js';
import { IWriteRepository } from '../IWriteRepository.js';

export interface IPermissionRepository extends IReadRepository<Permission, number>, IWriteRepository<Permission, number> {
  findByKey(key: string): Promise<Permission | null>;
}
