import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyPluginAsync } from 'fastify';
import { JwtConfig } from '../config/index.js';
import { JwtPayload } from '../../surfaces/auth/infrastructure/jwt.service.interface.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

const jwtPlugin: FastifyPluginAsync = async (fastify) => {
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

  fastify.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
};

export default fp(jwtPlugin, {
  name: 'jwt-plugin',
});
