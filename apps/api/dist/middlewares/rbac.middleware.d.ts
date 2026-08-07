import { FastifyRequest, FastifyReply } from 'fastify';
import { AppRole, AppPermission } from '../modules/auth/domain/rbac.js';
export declare const requireRole: (allowedRoles: AppRole[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
export declare const requirePermission: (requiredPermissions: AppPermission[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
