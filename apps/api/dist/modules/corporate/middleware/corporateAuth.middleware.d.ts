import { FastifyRequest, FastifyReply } from 'fastify';
import { ICorporateMemberRepository, CorporateMemberRole } from '@carbroz/foundation-kernel';
export declare function createCorporateAuthMiddleware(corporateMemberRepo: ICorporateMemberRepository): (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
export declare function requireCorporateRole(allowedRoles: CorporateMemberRole[]): (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
