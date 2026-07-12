import { FastifyPluginAsync } from 'fastify';
import { JwtPayload } from '../modules/auth/infrastructure/jwt.service.interface.js';
declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: JwtPayload;
        user: JwtPayload;
    }
}
declare const _default: FastifyPluginAsync;
export default _default;
