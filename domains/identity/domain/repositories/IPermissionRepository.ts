import type { IReadRepository, IWriteRepository } from '@carbroz/foundation-kernel';
import type { Permission } from '../Permission.js';

/** IPermissionRepository is an exported domains/identity contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IPermissionRepository extends IReadRepository<Permission, number>, IWriteRepository<Permission, number> {
  findByKey(key: string): Promise<Permission | null>;
}
