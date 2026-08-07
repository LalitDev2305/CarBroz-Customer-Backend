import fp from 'fastify-plugin';
import { ResponseHelper } from '@carbroz/foundation-kernel';
const authorizationPlugin = async (fastify) => {
    const checkAuth = async (request, reply, validator) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            return reply.code(401).send(ResponseHelper.error('Authentication required', 'UNAUTHORIZED'));
        }
        const userId = request.user?.id;
        if (!userId) {
            return reply.code(401).send(ResponseHelper.error('Invalid token payload', 'UNAUTHORIZED'));
        }
        const provider = request.diScope.resolve('authorizationProvider');
        const hasAccess = await validator(provider, parseInt(userId, 10));
        if (!hasAccess) {
            return reply.code(403).send(ResponseHelper.error('Insufficient permissions', 'FORBIDDEN'));
        }
    };
    fastify.decorate('requirePermission', (permissionKey) => {
        return async (request, reply) => {
            await checkAuth(request, reply, (p, uId) => p.hasPermission(uId, permissionKey));
        };
    });
    fastify.decorate('requireAnyPermission', (permissionKeys) => {
        return async (request, reply) => {
            await checkAuth(request, reply, (p, uId) => p.hasAnyPermission(uId, permissionKeys));
        };
    });
    fastify.decorate('requireAllPermissions', (permissionKeys) => {
        return async (request, reply) => {
            await checkAuth(request, reply, (p, uId) => p.hasAllPermissions(uId, permissionKeys));
        };
    });
};
export default fp(authorizationPlugin, {
    name: 'authorization-plugin',
    dependencies: ['jwt-plugin', 'di-plugin']
});
//# sourceMappingURL=authorization.plugin.js.map