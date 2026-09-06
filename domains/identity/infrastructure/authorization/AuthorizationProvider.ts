import type { IAdminRoleRepository } from '../../domain/repositories/IAdminRoleRepository.js';
import type { IRoleRepository } from '../../domain/repositories/IRoleRepository.js';
import type { IPermissionRepository } from '../../domain/repositories/IPermissionRepository.js';

/** Identity-owned RBAC implementation. API composition consumes only the public authorization port. */
export class AuthorizationProvider {
  constructor(
    private readonly adminRoleRepository: IAdminRoleRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async hasPermission(userId: number, permissionKey: string): Promise<boolean> {
    const roleIds = await this.adminRoleRepository.findRolesForUser(userId);
    if (roleIds.length === 0) return false;

    for (const roleId of roleIds) {
      const role = await this.roleRepository.findWithPermissions(roleId);
      if (role?.name === 'SUPER_ADMIN') return true;
    }

    const permission = await this.permissionRepository.findByKey(permissionKey);
    if (!permission) return false;

    for (const roleId of roleIds) {
      const role = await this.roleRepository.findWithPermissions(roleId);
      if (role?.permissions.includes(permission.id)) return true;
    }
    return false;
  }

  async hasAnyPermission(userId: number, permissionKeys: string[]): Promise<boolean> {
    for (const permissionKey of permissionKeys) {
      if (await this.hasPermission(userId, permissionKey)) return true;
    }
    return false;
  }

  async hasAllPermissions(userId: number, permissionKeys: string[]): Promise<boolean> {
    for (const permissionKey of permissionKeys) {
      if (!(await this.hasPermission(userId, permissionKey))) return false;
    }
    return true;
  }

  async getRoles(userId: number): Promise<string[]> {
    const roleIds = await this.adminRoleRepository.findRolesForUser(userId);
    const roles: string[] = [];
    for (const roleId of roleIds) {
      const role = await this.roleRepository.findById(roleId);
      if (role) roles.push(role.name);
    }
    return roles;
  }
}
