export class SendOtpUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(input) {
        const { phoneNumber } = input;
        const user = await this.userRepository.findByPhoneNumber(phoneNumber);
        const isNewUser = !user;
        const mockOtp = '123456';
        return {
            message: 'OTP sent successfully',
            mockOtp,
            isNewUser,
            nextScreen: {
                template: 'form_template',
                api: 'auth/auth_otp'
            }
        };
    }
}
//# sourceMappingURL=SendOtpUseCase.js.map