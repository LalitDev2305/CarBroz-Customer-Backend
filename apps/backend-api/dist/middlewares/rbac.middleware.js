import { ForbiddenError } from '@carbroz/common';
import { RolePermissions } from '../modules/auth/domain/rbac.js';
export const requireRole = (allowedRoles) => {
    return async (request, reply) => {
        if (!request.user || !request.user.roles) {
            throw new ForbiddenError('Access Denied: Missing roles');
        }
        const hasRole = request.user.roles.some((role) => allowedRoles.includes(role));
        if (!hasRole) {
            throw new ForbiddenError('Access Denied: Insufficient role');
        }
    };
};
export const requirePermission = (requiredPermissions) => {
    return async (request, reply) => {
        if (!request.user || !request.user.roles) {
            throw new ForbiddenError('Access Denied: Missing permissions');
        }
        const userRoles = request.user.roles;
        const userPermissions = new Set();
        userRoles.forEach(role => {
            const permissions = RolePermissions[role] || [];
            permissions.forEach(p => userPermissions.add(p));
        });
        const hasPermission = requiredPermissions.every((perm) => userPermissions.has(perm));
        if (!hasPermission) {
            throw new ForbiddenError('Access Denied: Insufficient permissions');
        }
    };
};
//# sourceMappingURL=rbac.middleware.js.map