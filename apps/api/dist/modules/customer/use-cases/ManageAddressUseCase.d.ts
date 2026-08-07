import { IUseCase, IRequestContext, IAddressRepository, Address } from '@carbroz/foundation-kernel';
export type AddressAction = 'ADD' | 'UPDATE' | 'DELETE' | 'GET_ALL' | 'GET_DEFAULT';
export interface ManageAddressRequest {
    userId: number;
    action: AddressAction;
    addressId?: number;
    payload?: Partial<Address>;
}
export declare class ManageAddressUseCase implements IUseCase<{
    context: IRequestContext;
    data: ManageAddressRequest;
}, Address | Address[] | null | boolean> {
    private readonly addressRepository;
    constructor(addressRepository: IAddressRepository);
    execute(request: {
        context: IRequestContext;
        data: ManageAddressRequest;
    }): Promise<Address | Address[] | boolean | null>;
}
