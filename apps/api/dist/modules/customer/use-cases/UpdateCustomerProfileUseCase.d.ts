import { IUseCase, IRequestContext, ICustomerProfileRepository, CustomerProfile } from '@carbroz/foundation-kernel';
export interface UpdateCustomerProfileRequest {
    userId: number;
    firstName?: string | null;
    lastName?: string | null;
    dateOfBirth?: Date | null;
    gender?: string | null;
    marketingOptIn?: boolean;
}
export declare class UpdateCustomerProfileUseCase implements IUseCase<{
    context: IRequestContext;
    data: UpdateCustomerProfileRequest;
}, CustomerProfile> {
    private readonly customerProfileRepository;
    constructor(customerProfileRepository: ICustomerProfileRepository);
    execute(request: {
        context: IRequestContext;
        data: UpdateCustomerProfileRequest;
    }): Promise<CustomerProfile>;
}
