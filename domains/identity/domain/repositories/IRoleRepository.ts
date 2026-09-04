import type { IReadRepository, IWriteRepository } from '@carbroz/foundation-kernel';
import type { Role } from '../Role.js';

export interface IRoleRepository extends IReadRepository<Role, number>, IWriteRepository<Role, number> {
  findByName(name: string): Promise<Role | null>;
  findWithPermissions(roleId: number): Promise<Role & { permissions: number[] } | null>;
}
