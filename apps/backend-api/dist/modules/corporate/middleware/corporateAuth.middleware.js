export function createCorporateAuthMiddleware(corporateMemberRepo) {
    return async (request, reply) => {
        const user = request.user;
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
        request.corporateMember = member;
    };
}
export function requireCorporateRole(allowedRoles) {
    return async (request, reply) => {
        const member = request.corporateMember;
        if (!member || !allowedRoles.includes(member.role)) {
            return reply.status(403).send({
                success: false,
                error: { code: 'FORBIDDEN', message: `Insufficient corporate role. Required: ${allowedRoles.join(', ')}` },
            });
        }
    };
}
//# sourceMappingURL=corporateAuth.middleware.js.map