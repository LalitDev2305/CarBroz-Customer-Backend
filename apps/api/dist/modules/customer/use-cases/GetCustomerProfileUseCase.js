import { CustomerProfile } from '@carbroz/foundation-kernel';
export class GetCustomerProfileUseCase {
    customerProfileRepository;
    constructor(customerProfileRepository) {
        this.customerProfileRepository = customerProfileRepository;
    }
    async execute(request) {
        const user = request.context.authenticatedUser;
        if (user?.id !== request.data.userId && !user?.isAdmin) {
            throw new Error('FORBIDDEN: You do not have permission to view this profile');
        }
        let profile = await this.customerProfileRepository.findByUserId(request.data.userId);
        if (!profile) {
            // Auto-create empty profile
            profile = await this.customerProfileRepository.save(new CustomerProfile({
                userId: request.data.userId,
                firstName: null,
                lastName: null,
                dateOfBirth: null,
                gender: null,
                marketingOptIn: false,
            }));
        }
        return profile;
    }
}
//# sourceMappingURL=GetCustomerProfileUseCase.js.map