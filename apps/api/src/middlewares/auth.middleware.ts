import { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/jwt';
import { UnauthorizedError } from '@carbroz/common';

export const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    throw new UnauthorizedError('Authentication required');
  }
};

export const optionalAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    if (request.headers.authorization) {
      await request.jwtVerify();
    }
  } catch (err) {
    // Silently fail, user remains undefined
  }
};
