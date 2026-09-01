import { FastifyRequest, FastifyReply } from 'fastify';
import { ICorporateMemberRepository, CorporateMemberRole } from '@carbroz/common';

export function createCorporateAuthMiddleware(corporateMemberRepo: ICorporateMemberRepository) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user || !user.id) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const member = await corporateMemberRepo.findByUserId(user.id);
    if (!member || member.status !== 'ACTIVE') {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'User is not an active member of any corporate account' },
      });
    }

    (request as any).corporateMember = member;
  };
}

export function requireCorporateRole(allowedRoles: CorporateMemberRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const member = (request as any).corporateMember;
    if (!member || !allowedRoles.includes(member.role)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: `Insufficient corporate role. Required: ${allowedRoles.join(', ')}` },
      });
    }
  };
}
