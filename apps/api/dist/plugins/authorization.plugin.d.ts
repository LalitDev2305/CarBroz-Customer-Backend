import { FastifyPluginAsync } from 'fastify';
declare module 'fastify' {
    interface FastifyInstance {
        requirePermission(permissionKey: string): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
        requireAnyPermission(permissionKeys: string[]): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
        requireAllPermissions(permissionKeys: string[]): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}
declare const _default: FastifyPluginAsync;
export default _default;
