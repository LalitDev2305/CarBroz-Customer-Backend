import { FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenError } from '@carbroz/common';
import { AppRole, AppPermission, RolePermissions } from '../modules/auth/domain/rbac.js';

export const requireRole = (allowedRoles: AppRole[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user || !request.user.roles) {
      throw new ForbiddenError('Access Denied: Missing roles');
    }

    const hasRole = request.user.roles.some((role) => allowedRoles.includes(role as AppRole));
    if (!hasRole) {
      throw new ForbiddenError('Access Denied: Insufficient role');
    }
  };
};

export const requirePermission = (requiredPermissions: AppPermission[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user || !request.user.roles) {
      throw new ForbiddenError('Access Denied: Missing permissions');
    }

    const userRoles = request.user.roles as AppRole[];
    const userPermissions = new Set<AppPermission>();

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
