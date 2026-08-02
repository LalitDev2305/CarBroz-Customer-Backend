import { ValidationError } from '@carbroz/common';
export class VerifyOtpUseCase {
    userRepository;
    userSessionRepository;
    constructor(userRepository, userSessionRepository) {
        this.userRepository = userRepository;
        this.userSessionRepository = userSessionRepository;
    }
    async execute(input) {
        const { phoneNumber, otp, deviceId, deviceModel, osVersion, fcmToken } = input;
        if (otp !== '123456' && otp !== '111111') {
            throw new ValidationError('Invalid OTP');
        }
        const user = await this.userRepository.upsert(phoneNumber, {
            role: 'USER',
            isGuest: false,
        });
        const refreshToken = `rt_${Buffer.from(user.id + Date.now().toString()).toString('base64')}`;
        const session = await this.userSessionRepository.upsert(user.id, deviceId, {
            deviceModel,
            osVersion,
            fcmToken,
            refreshToken,
        });
        return {
            user,
            session,
            nextScreen: {
                template: 'dashboard_template',
                api: 'home'
            }
        };
    }
}
//# sourceMappingURL=VerifyOtpUseCase.js.map