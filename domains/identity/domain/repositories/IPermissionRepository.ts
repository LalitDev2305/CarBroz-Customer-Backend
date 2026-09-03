import { type Permission } from '../Permission.js';
import { type IReadRepository } from '@carbroz/foundation-kernel';
import { type IWriteRepository } from '@carbroz/foundation-kernel';

export interface IPermissionRepository extends IReadRepository<Permission, number>, IWriteRepository<Permission, number> {
  findByKey(key: string): Promise<Permission | null>;
}
