import { Permission } from '../entities/Permission.js';

export interface PermissionRepository {
  findAll(): Promise<Permission[]>;
}
