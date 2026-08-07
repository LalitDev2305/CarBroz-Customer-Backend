import { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/jwt';
export declare const requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
export declare const optionalAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
