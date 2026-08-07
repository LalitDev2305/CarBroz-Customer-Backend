export class ExtractCustomerDataUseCase {
    customerProfileRepository;
    addressRepository;
    constructor(customerProfileRepository, addressRepository) {
        this.customerProfileRepository = customerProfileRepository;
        this.addressRepository = addressRepository;
    }
    async execute(request) {
        const user = request.context.authenticatedUser;
        if (user?.id !== request.data.userId && !user?.isAdmin) {
            throw new Error('FORBIDDEN: You do not have permission to extract this data');
        }
        const userId = request.data.userId;
        const profile = await this.customerProfileRepository.findByUserId(userId);
        const addresses = await this.addressRepository.findByUserId(userId);
        // Later phases will add bookings, orders, etc.
        return {
            userId,
            extractedAt: new Date().toISOString(),
            profile: profile ? {
                firstName: profile.firstName,
                lastName: profile.lastName,
                dateOfBirth: profile.dateOfBirth,
                gender: profile.gender,
                marketingOptIn: profile.marketingOptIn,
                createdAt: profile.createdAt,
            } : null,
            addresses: addresses.map(addr => ({
                label: addr.label,
                addressLine1: addr.addressLine1,
                addressLine2: addr.addressLine2,
                city: addr.city,
                state: addr.state,
                postalCode: addr.postalCode,
                country: addr.country,
                isDefault: addr.isDefault,
                createdAt: addr.createdAt
            }))
        };
    }
}
//# sourceMappingURL=ExtractCustomerDataUseCase.js.map