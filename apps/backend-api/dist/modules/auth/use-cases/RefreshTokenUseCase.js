import { UnauthorizedError } from '@carbroz/common';
export class RefreshTokenUseCase {
    userSessionRepository;
    constructor(userSessionRepository) {
        this.userSessionRepository = userSessionRepository;
    }
    async execute(input) {
        const { refreshToken, deviceId } = input;
        const session = await this.userSessionRepository.findByRefreshToken(refreshToken, deviceId);
        if (!session) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }
        const newRefreshToken = `rt_${Buffer.from(session.userId + Date.now().toString()).toString('base64')}`;
        const updatedSession = await this.userSessionRepository.save({
            ...session,
            refreshToken: newRefreshToken,
            lastActiveAt: new Date()
        });
        return {
            user: updatedSession.user,
            session: updatedSession
        };
    }
}
//# sourceMappingURL=RefreshTokenUseCase.js.map