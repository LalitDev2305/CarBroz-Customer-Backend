import { sendOtpSchema, verifyOtpSchema } from '../validator/auth.validator.js';
describe('Auth Validators', () => {
    describe('sendOtpSchema', () => {
        it('should validate a correct mobile number', () => {
            const result = sendOtpSchema.safeParse({ mobileNumber: '+1234567890' });
            expect(result.success).toBe(true);
        });
        it('should reject an invalid mobile number', () => {
            const result = sendOtpSchema.safeParse({ mobileNumber: 'invalid' });
            expect(result.success).toBe(false);
        });
    });
    describe('verifyOtpSchema', () => {
        it('should require 6 digit OTP', () => {
            const result = verifyOtpSchema.safeParse({
                mobileNumber: '+1234567890',
                otp: '123', // Too short
                deviceId: 'dev123',
                platform: 'ios',
                appVersion: '1.0.0'
            });
            expect(result.success).toBe(false);
        });
    });
});
//# sourceMappingURL=auth.validator.spec.js.map