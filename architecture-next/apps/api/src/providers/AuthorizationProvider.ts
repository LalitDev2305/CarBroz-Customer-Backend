import { IAuthorizationProvider, IAdminRoleRepository, IRoleRepository, IPermissionRepository } from '@carbroz/common';

export class AuthorizationProvider implements IAuthorizationProvider {
  constructor(
    private readonly adminRoleRepository: IAdminRoleRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async hasPermission(userId: number, permissionKey: string): Promise<boolean> {
    const roles = await this.adminRoleRepository.findRolesForUser(userId);
    if (roles.length === 0) return false;

    // Fast check for super admin
    for (const roleId of roles) {
      const role = await this.roleRepository.findWithPermissions(roleId);
      if (role && role.name === 'SUPER_ADMIN') {
        return true; // Super admin has all permissions
      }
    }

    const permission = await this.permissionRepository.findByKey(permissionKey);
    if (!permission) return false;

    for (const roleId of roles) {
      const role = await this.roleRepository.findWithPermissions(roleId);
      if (role && role.permissions.includes(permission.id)) {
        return true;
      }
    }
    return false;
  }

  async hasAnyPermission(userId: number, permissionKeys: string[]): Promise<boolean> {
    for (const key of permissionKeys) {
      if (await this.hasPermission(userId, key)) {
        return true;
      }
    }
    return false;
  }

  async hasAllPermissions(userId: number, permissionKeys: string[]): Promise<boolean> {
    for (const key of permissionKeys) {
      if (!(await this.hasPermission(userId, key))) {
        return false;
      }
    }
    return true;
  }

  async getRoles(userId: number): Promise<string[]> {
    const roleIds = await this.adminRoleRepository.findRolesForUser(userId);
    const roles: string[] = [];
    for (const id of roleIds) {
      const role = await this.roleRepository.findById(id);
      if (role) {
        roles.push(role.name);
      }
    }
    return roles;
  }
}
