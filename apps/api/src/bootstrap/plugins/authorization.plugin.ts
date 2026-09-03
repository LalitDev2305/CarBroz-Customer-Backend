import { ResponseHelper } from '../../transport/response/ResponseHelper.js';
import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { type IAuthorizationProvider } from '@carbroz/domain-identity';


declare module 'fastify' {
  interface FastifyInstance {
    requirePermission(permissionKey: string): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAnyPermission(permissionKeys: string[]): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAllPermissions(permissionKeys: string[]): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authorizationPlugin: FastifyPluginAsync = async (fastify) => {
  const checkAuth = async (request: FastifyRequest, reply: FastifyReply, validator: (provider: IAuthorizationProvider, userId: number) => Promise<boolean>) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.code(401).send(ResponseHelper.error('Authentication required', 'UNAUTHORIZED'));
    }

    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send(ResponseHelper.error('Invalid token payload', 'UNAUTHORIZED'));
    }

    const provider = request.diScope.resolve<IAuthorizationProvider>('authorizationProvider');
    const hasAccess = await validator(provider, parseInt(userId, 10));
    
    if (!hasAccess) {
      return reply.code(403).send(ResponseHelper.error('Insufficient permissions', 'FORBIDDEN'));
    }
  };

  fastify.decorate('requirePermission', (permissionKey: string) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      await checkAuth(request, reply, (p, uId) => p.hasPermission(uId, permissionKey));
    };
  });

  fastify.decorate('requireAnyPermission', (permissionKeys: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      await checkAuth(request, reply, (p, uId) => p.hasAnyPermission(uId, permissionKeys));
    };
  });

  fastify.decorate('requireAllPermissions', (permissionKeys: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      await checkAuth(request, reply, (p, uId) => p.hasAllPermissions(uId, permissionKeys));
    };
  });
};

export default fp(authorizationPlugin, {
  name: 'authorization-plugin',
  dependencies: ['jwt-plugin', 'di-plugin']
});
