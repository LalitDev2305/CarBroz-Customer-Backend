import { IUseCase, IRequestContext, ICustomerProfileRepository, IAddressRepository } from '@carbroz/foundation-kernel';
export interface ExtractCustomerDataRequest {
    userId: number;
}
export declare class ExtractCustomerDataUseCase implements IUseCase<{
    context: IRequestContext;
    data: ExtractCustomerDataRequest;
}, any> {
    private readonly customerProfileRepository;
    private readonly addressRepository;
    constructor(customerProfileRepository: ICustomerProfileRepository, addressRepository: IAddressRepository);
    execute(request: {
        context: IRequestContext;
        data: ExtractCustomerDataRequest;
    }): Promise<any>;
}
