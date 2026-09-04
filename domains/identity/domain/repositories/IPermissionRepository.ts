import type { IReadRepository, IWriteRepository } from '@carbroz/foundation-kernel';
import type { Permission } from '../Permission.js';

export interface IPermissionRepository extends IReadRepository<Permission, number>, IWriteRepository<Permission, number> {
  findByKey(key: string): Promise<Permission | null>;
}
