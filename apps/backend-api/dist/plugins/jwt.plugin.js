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
    fastify.decorate('authenticate', async function (request, reply) {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.send(err);
        }
    });
};
export default fp(jwtPlugin, {
    name: 'jwt-plugin',
});
//# sourceMappingURL=jwt.plugin.js.map