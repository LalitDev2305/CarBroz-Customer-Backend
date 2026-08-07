import { Role } from '../entities/Role.js';

export interface RoleRepository {
  findById(id: number): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
}
