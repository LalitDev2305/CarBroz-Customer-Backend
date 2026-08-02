import { Role } from '../Role.js';
import { IReadRepository } from '../IReadRepository.js';
import { IWriteRepository } from '../IWriteRepository.js';

export interface IRoleRepository extends IReadRepository<Role, number>, IWriteRepository<Role, number> {
  findByName(name: string): Promise<Role | null>;
  findWithPermissions(roleId: number): Promise<Role & { permissions: number[] } | null>;
}
