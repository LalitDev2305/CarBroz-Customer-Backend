import type { FastifyRequest } from 'fastify';
import type { ActorIdentity, ActorKind, ExecutionContext } from '@carbroz/foundation-kernel';

function actorKindFromRoles(roles: readonly string[]): ActorKind {
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('PARTNER')) return 'PARTNER';
  if (roles.includes('GUEST')) return 'GUEST';
  return 'CUSTOMER';
}

/**
 * Converts Fastify/JWT request metadata into the canonical transport-neutral execution context.
 *
 * This is an API composition concern: domains receive correlation/actor/time metadata only and
 * never Fastify requests, JWT payloads or the transitional IRequestContext contract.
 */
export function toExecutionContext(request: FastifyRequest): ExecutionContext {
  const jwtUser = request.user;
  const actor: ActorIdentity | undefined = jwtUser
    ? {
        id: jwtUser.id,
        kind: actorKindFromRoles(jwtUser.roles),
        roles: jwtUser.roles,
      }
    : undefined;

  return {
    correlationId: request.traceId || request.id,
    actor,
    timestamp: new Date(),
  };
}
