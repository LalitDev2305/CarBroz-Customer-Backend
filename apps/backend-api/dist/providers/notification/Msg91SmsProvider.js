export class Msg91SmsProvider {
    async sendSms(input) {
        if (!input.phoneNumber) {
            return { success: false, errorCode: 'MISSING_PHONE_NUMBER' };
        }
        // Provider delivery stub (Msg91 Flow API)
        const providerReference = `msg91_${Date.now()}`;
        return {
            success: true,
            providerReference,
        };
    }
}
//# sourceMappingURL=Msg91SmsProvider.js.map