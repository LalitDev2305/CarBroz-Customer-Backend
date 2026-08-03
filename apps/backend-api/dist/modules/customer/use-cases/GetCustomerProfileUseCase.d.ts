import { IUseCase, IRequestContext, ICustomerProfileRepository, CustomerProfile } from '@carbroz/common';
export interface GetCustomerProfileRequest {
    userId: number;
}
export declare class GetCustomerProfileUseCase implements IUseCase<{
    context: IRequestContext;
    data: GetCustomerProfileRequest;
}, CustomerProfile> {
    private readonly customerProfileRepository;
    constructor(customerProfileRepository: ICustomerProfileRepository);
    execute(request: {
        context: IRequestContext;
        data: GetCustomerProfileRequest;
    }): Promise<CustomerProfile>;
}
