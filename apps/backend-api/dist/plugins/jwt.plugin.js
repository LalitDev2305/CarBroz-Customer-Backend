import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { JwtConfig } from '@carbroz/config';
const jwtPlugin = async (fastify) => {
    // @ts-ignore
    fastify.register(fastifyJwt, {
        secret: JwtConfig.secret,
        sign: {
            issuer: JwtConfig.issuer,
            expiresIn: JwtConfig.accessExpiration,
        },
        verify: {
            allowedIssuers: [JwtConfig.issuer],
        },
    });
};
export default fp(jwtPlugin, {
    name: 'jwt-plugin',
});
//# sourceMappingURL=jwt.plugin.js.map