import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyPluginAsync } from 'fastify';
import { JwtConfig } from '@carbroz/config';
import { JwtPayload } from '../modules/auth/infrastructure/jwt.service.interface.js';

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
};

export default fp(jwtPlugin, {
  name: 'jwt-plugin',
});
