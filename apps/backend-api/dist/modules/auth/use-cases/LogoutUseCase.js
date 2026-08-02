export class LogoutUseCase {
    userSessionRepository;
    constructor(userSessionRepository) {
        this.userSessionRepository = userSessionRepository;
    }
    async execute(input) {
        const { sessionId, userId, logoutAll } = input;
        if (logoutAll && userId) {
            await this.userSessionRepository.revokeAllForUser(userId);
        }
        else if (sessionId) {
            await this.userSessionRepository.save({
                id: sessionId,
                isRevoked: true,
                refreshToken: null
            });
        }
    }
}
//# sourceMappingURL=LogoutUseCase.js.map