export class ResendEmailProvider {
    async sendEmail(input) {
        if (!input.toEmail) {
            return { success: false, errorCode: 'MISSING_EMAIL_ADDRESS' };
        }
        // Provider delivery stub (Resend API)
        const providerReference = `resend_${Date.now()}`;
        return {
            success: true,
            providerReference,
        };
    }
}
//# sourceMappingURL=ResendEmailProvider.js.map