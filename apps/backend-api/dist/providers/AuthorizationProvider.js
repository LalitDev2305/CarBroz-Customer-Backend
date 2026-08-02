export class AuthorizationProvider {
    adminRoleRepository;
    roleRepository;
    permissionRepository;
    constructor(adminRoleRepository, roleRepository, permissionRepository) {
        this.adminRoleRepository = adminRoleRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }
    async hasPermission(userId, permissionKey) {
        const roles = await this.adminRoleRepository.findRolesForUser(userId);
        if (roles.length === 0)
            return false;
        // Fast check for super admin
        for (const roleId of roles) {
            const role = await this.roleRepository.findWithPermissions(roleId);
            if (role && role.name === 'SUPER_ADMIN') {
                return true; // Super admin has all permissions
            }
        }
        const permission = await this.permissionRepository.findByKey(permissionKey);
        if (!permission)
            return false;
        for (const roleId of roles) {
            const role = await this.roleRepository.findWithPermissions(roleId);
            if (role && role.permissions.includes(permission.id)) {
                return true;
            }
        }
        return false;
    }
    async hasAnyPermission(userId, permissionKeys) {
        for (const key of permissionKeys) {
            if (await this.hasPermission(userId, key)) {
                return true;
            }
        }
        return false;
    }
    async hasAllPermissions(userId, permissionKeys) {
        for (const key of permissionKeys) {
            if (!(await this.hasPermission(userId, key))) {
                return false;
            }
        }
        return true;
    }
    async getRoles(userId) {
        const roleIds = await this.adminRoleRepository.findRolesForUser(userId);
        const roles = [];
        for (const id of roleIds) {
            const role = await this.roleRepository.findById(id);
            if (role) {
                roles.push(role.name);
            }
        }
        return roles;
    }
}
//# sourceMappingURL=AuthorizationProvider.js.map