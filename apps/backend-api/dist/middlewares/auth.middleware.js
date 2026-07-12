import '@fastify/jwt';
import { UnauthorizedError } from '@carbroz/common';
export const requireAuth = async (request, reply) => {
    try {
        await request.jwtVerify();
    }
    catch (err) {
        throw new UnauthorizedError('Authentication required');
    }
};
export const optionalAuth = async (request, reply) => {
    try {
        if (request.headers.authorization) {
            await request.jwtVerify();
        }
    }
    catch (err) {
        // Silently fail, user remains undefined
    }
};
//# sourceMappingURL=auth.middleware.js.map